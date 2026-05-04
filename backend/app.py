import os
from datetime import date, datetime, timedelta
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

from models import Project, Task, User, db

load_dotenv()

VALID_ROLES = {"Admin", "Member"}
VALID_STATUSES = {"To Do", "In Progress", "Done"}

def create_app():
    app = Flask(__name__)

    # Railway provides the DATABASE_URL and SECRET_KEY environment variables
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    
    if not app.config["SQLALCHEMY_DATABASE_URI"] or not app.config["SECRET_KEY"]:
        raise RuntimeError("DATABASE_URL and SECRET_KEY must be set in the environment.")

    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True # Assume HTTPS on Railway

    CORS(app, supports_credentials=True, origins=[os.getenv("CORS_ORIGINS", "http://localhost:3000")])

    db.init_app(app)

    # It's better to use Flask-Migrate for database migrations
    # and a separate script for seeding in a production environment.
    with app.app_context():
        db.create_all()

    return app


app = create_app()



def active_query(model):
    return model.query.filter(model.deleted_at.is_(None))


def parse_date(value):
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return active_query(User).filter_by(id=user_id).first()


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        return func(*args, **kwargs)

    return wrapper


def role_required(*roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({"error": "Authentication required"}), 401
            if user.role not in roles:
                return jsonify({"error": "Permission denied"}), 403
            return func(*args, **kwargs)

        return wrapper

    return decorator


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True})


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = "Member"

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are required"}), 400
    if role not in VALID_ROLES:
        return jsonify({"error": "Invalid role"}), 400

    existing_user = active_query(User).filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email is already in use"}), 409

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        role=role,
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered", "user": user.to_dict()}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = active_query(User).filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    if user.is_blocked:
        return jsonify({"error": "Your account has been blocked by administrator"}), 403

    session["user_id"] = user.id
    session["role"] = user.role
    return jsonify({"message": "Login successful", "user": user.to_dict()})


@app.route("/api/auth/logout", methods=["POST"])
@login_required
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


@app.route("/api/auth/me", methods=["GET"])
@login_required
def me():
    user = get_current_user()
    return jsonify({"user": user.to_dict()})


@app.route("/api/users/members", methods=["GET"])
@role_required("Admin")
def list_members():
    members = active_query(User).filter_by(role="Member").all()
    return jsonify({"members": [member.to_dict() for member in members]})


@app.route("/api/users/<int:user_id>/block", methods=["PUT"])
@role_required("Admin")
def block_user(user_id):
    user = active_query(User).filter_by(id=user_id, role="Member").first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user.is_blocked = True
    db.session.commit()
    return jsonify({"message": "User blocked", "user": user.to_dict()})


@app.route("/api/users/<int:user_id>/unblock", methods=["PUT"])
@role_required("Admin")
def unblock_user(user_id):
    user = active_query(User).filter_by(id=user_id, role="Member").first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user.is_blocked = False
    db.session.commit()
    return jsonify({"message": "User unblocked", "user": user.to_dict()})


@app.route("/api/projects", methods=["POST"])
@role_required("Admin")
def create_project():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    user = get_current_user()

    if not name:
        return jsonify({"error": "Project name is required"}), 400

    project = Project(name=name, description=description, created_by=user.id)
    db.session.add(project)
    db.session.commit()
    return jsonify({"project": project.to_dict()}), 201


@app.route("/api/projects", methods=["GET"])
@login_required
def list_projects():
    projects = active_query(Project).all()
    return jsonify({"projects": [project.to_dict() for project in projects]})


@app.route("/api/projects/<int:project_id>", methods=["DELETE"])
@role_required("Admin")
def delete_project(project_id):
    project = active_query(Project).filter_by(id=project_id).first()
    if not project:
        return jsonify({"error": "Project not found"}), 404

    project.soft_delete()

    tasks = active_query(Task).filter_by(project_id=project.id).all()
    for task in tasks:
        task.soft_delete()

    db.session.commit()
    return jsonify({"message": "Project soft deleted"})


@app.route("/api/tasks", methods=["POST"])
@role_required("Admin")
def create_task():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    status = data.get("status", "To Do")
    priority = data.get("priority", "Medium")
    project_id = data.get("project_id")
    assigned_to = data.get("assigned_to")
    due_date = parse_date(data.get("due_date"))
    user = get_current_user()

    if not title or not project_id:
        return jsonify({"error": "title and project_id are required"}), 400
    if status not in VALID_STATUSES:
        return jsonify({"error": "Invalid task status"}), 400
    if priority not in ["Low", "Medium", "High"]:
        priority = "Medium"

    project = active_query(Project).filter_by(id=project_id).first()
    if not project:
        return jsonify({"error": "Project not found"}), 404

    if assigned_to is not None:
        member = active_query(User).filter_by(id=assigned_to, role="Member").first()
        if not member:
            return jsonify({"error": "Assigned member not found"}), 404

    task = Task(
        title=title,
        description=description,
        status=status,
        priority=priority,
        due_date=due_date,
        project_id=project.id,
        assigned_to=assigned_to,
        created_by=user.id,
        completed_at=datetime.utcnow() if status == "Done" else None,
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({"task": task.to_dict()}), 201


@app.route("/api/tasks", methods=["GET"])
@login_required
def list_tasks():
    user = get_current_user()
    query = active_query(Task).join(Project).filter(Project.deleted_at.is_(None))

    if user.role == "Member":
        query = query.filter(Task.assigned_to == user.id)

    tasks = query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc()).all()
    return jsonify({"tasks": [task.to_dict() for task in tasks]})


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
@role_required("Admin")
def update_task_admin(task_id):
    data = request.get_json() or {}
    task = (
        active_query(Task)
        .join(Project)
        .filter(Task.id == task_id, Project.deleted_at.is_(None))
        .first()
    )
    if not task:
        return jsonify({"error": "Task not found"}), 404

    if "status" in data:
        status = data["status"]
        if status in VALID_STATUSES:
            task.status = status
            task.completed_at = datetime.utcnow() if status == "Done" else None

    if "priority" in data:
        priority = data["priority"]
        if priority in ["Low", "Medium", "High"]:
            task.priority = priority

    db.session.commit()
    return jsonify({"task": task.to_dict()})


@app.route("/api/tasks/<int:task_id>/status", methods=["PUT"])
@login_required
def update_task_status(task_id):
    user = get_current_user()
    data = request.get_json() or {}
    status = data.get("status")
    if status not in VALID_STATUSES:
        return jsonify({"error": "Invalid task status"}), 400

    task = (
        active_query(Task)
        .join(Project)
        .filter(Task.id == task_id, Project.deleted_at.is_(None))
        .first()
    )
    if not task:
        return jsonify({"error": "Task not found"}), 404

    if user.role == "Member" and task.assigned_to != user.id:
        return jsonify({"error": "You can only update your assigned tasks"}), 403

    task.status = status
    task.completed_at = datetime.utcnow() if status == "Done" else None
    db.session.commit()
    return jsonify({"task": task.to_dict()})


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
@role_required("Admin")
def delete_task(task_id):
    task = active_query(Task).filter_by(id=task_id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404
    task.soft_delete()
    db.session.commit()
    return jsonify({"message": "Task soft deleted"})


@app.route("/api/admin/dashboard", methods=["GET"])
@role_required("Admin")
def admin_dashboard():
    now = datetime.utcnow()
    stale_cutoff = now - timedelta(days=5)

    members = active_query(User).filter_by(role="Member").all()
    active_tasks_by_member = []
    for member in members:
        active_count = (
            active_query(Task)
            .filter(Task.assigned_to == member.id, Task.status != "Done")
            .count()
        )
        active_tasks_by_member.append(
            {"member_id": member.id, "name": member.name, "active_tasks": active_count}
        )

    stale_tasks = (
        active_query(Task)
        .filter(Task.status == "In Progress", Task.updated_at <= stale_cutoff)
        .all()
    )
    unassigned_tasks = active_query(Task).filter(Task.assigned_to.is_(None)).all()

    return jsonify(
        {
            "active_tasks_per_member": active_tasks_by_member,
            "stale_tasks": [task.to_dict() for task in stale_tasks],
            "unassigned_tasks": [task.to_dict() for task in unassigned_tasks],
        }
    )


@app.route("/api/member/dashboard", methods=["GET"])
@role_required("Member")
def member_dashboard():
    user = get_current_user()
    today = date.today()
    tomorrow = today + timedelta(days=1)
    week_start = today - timedelta(days=today.weekday())

    my_tasks = active_query(Task).filter(Task.assigned_to == user.id).all()
    open_tasks = [task for task in my_tasks if task.status != "Done"]

    needs_attention = []
    due_tomorrow = []
    for task in open_tasks:
        if task.due_date and task.due_date <= today:
            needs_attention.append(task)
        elif task.due_date == tomorrow:
            due_tomorrow.append(task)

    completed_this_week = (
        active_query(Task)
        .filter(
            Task.assigned_to == user.id,
            Task.status == "Done",
            Task.completed_at.isnot(None),
            Task.completed_at >= datetime.combine(week_start, datetime.min.time()),
        )
        .count()
    )
    

    return jsonify(
        {
            "tasks": [task.to_dict() for task in my_tasks],
            "needs_attention": [task.to_dict() for task in needs_attention],
            "due_tomorrow": [task.to_dict() for task in due_tomorrow],
            "tasks_completed_this_week": completed_this_week,
        }
    )

if __name__ == "__main__":
    # Use debug=False in a production-like environment
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=False)
