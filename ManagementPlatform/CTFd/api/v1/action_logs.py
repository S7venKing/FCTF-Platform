from typing import List
from flask import request
from flask_restx import Namespace, Resource
from datetime import datetime
from pydantic import BaseModel, Field, ValidationError
from flask import jsonify
from CTFd.models import Tokens, Users
from CTFd.api.v1.helpers.schemas import sqlalchemy_to_pydantic
from CTFd.api.v1.schemas import APIDetailedSuccessResponse, APIListSuccessResponse
from CTFd.models import ActionLogs, db
from CTFd.utils.decorators import admins_only
from CTFd.utils.user import get_current_user
from CTFd.utils.connector.multiservice_connector import get_token_from_header

action_logs_namespace = Namespace("action_logs", description="Endpoint for action logging")

# Convert SQLAlchemy model to Pydantic schema for validation
ActionLogModel = sqlalchemy_to_pydantic(ActionLogs)

class ActionLogDetailedSuccessResponse(APIDetailedSuccessResponse):
    data: ActionLogModel

class ActionLogListSuccessResponse(APIListSuccessResponse):
    data: List[ActionLogModel]

action_logs_namespace.schema_model("ActionLogDetailedSuccessResponse", ActionLogDetailedSuccessResponse.apidoc())
action_logs_namespace.schema_model("ActionLogListSuccessResponse", ActionLogListSuccessResponse.apidoc())

class ActionLogCreateSchema(BaseModel):
    actionType: int = Field(..., description="Type of action", ge=0)
    actionDetail: str = Field(..., description="Details of the action", min_length=1, max_length=500)

@action_logs_namespace.route("")
class ActionLogList(Resource):
    def get(self):
        """Retrieve action logs"""
        try:
            logs = ActionLogs.query.order_by(ActionLogs.actionDate.desc()).all()
            response = [log.to_dict() for log in logs]
            return {"success": True, "data": response}, 200
        except Exception as e:
            return {"success": False, "error": str(e)}, 500

    def post(self):
        """Create a new action log"""
        try:
            user = get_current_user()
            print(user)
            if not user:
                generatedToken = get_token_from_header()
                print("da nhan token")
                if not generatedToken:
                    return {"success": False, "error": "No account or account has been banned"}, 403
                token = Tokens.query.filter_by(value=generatedToken).first()
                if token is None:
                    return {"success": False, "error": "Token not found"}, 404
                user = Users.query.filter_by(id=token.user_id).first()

            req_data = request.get_json()
            validated_data = ActionLogCreateSchema.parse_obj(req_data)

            log = ActionLogs(
                userId=user.id,
                actionDate=datetime.utcnow(),
                actionType=validated_data.actionType,
                actionDetail=validated_data.actionDetail
            )
            db.session.add(log)
            db.session.commit()

            return {"success": True, "data": log.to_dict()}, 200
        except ValidationError as e:
            return {"success": False, "error": e.errors()}, 400
        except Exception as e:
            return {"success": False, "error": str(e)}, 500

@action_logs_namespace.route("/<int:log_id>")
class ActionLog(Resource):
    def get(self, log_id):
        """Retrieve a specific action log"""
        try:
            user = get_current_user()
            if not user:
                generatedToken = get_token_from_header()
                if not generatedToken:
                    return {"success": False, "error": "No account or account has been banned"}, 403
                token = Tokens.query.filter_by(value=generatedToken).first()
                if token is None:
                    return {"success": False, "error": "Token not found"}, 404
                user = Users.query.filter_by(id=token.user_id).first()

            log = ActionLogs.query.filter_by(actionId=log_id).first()
            if not log:
                return {"success": False, "error": "Action log not found"}, 404

            if log.userId != user.id and user.type != "admin":
                return {"success": False, "error": "Permission denied"}, 403

            return {"success": True, "data": log.to_dict()}, 200
        except Exception as e:
            return {"success": False, "error": str(e)}, 500

    @admins_only
    def delete(self, log_id):
        """Delete a specific action log"""
        try:
            log = ActionLogs.query.filter_by(actionId=log_id).first()
            if not log:
                return {"success": False, "error": "Action log not found"}, 404

            db.session.delete(log)
            db.session.commit()
            return {"success": True}, 200
        except Exception as e:
            return {"success": False, "error": str(e)}, 500

@action_logs_namespace.route("/user/<int:user_id>")
class UserActionLog(Resource):
    def get(self, user_id):
        """Retrieve action logs of a specific user"""
        try:
            user = get_current_user()
            if not user:
                generatedToken = get_token_from_header()
                if not generatedToken:
                    return {"success": False, "error": "No account or account has been banned"}, 403
                token = Tokens.query.filter_by(value=generatedToken).first()
                if token is None:
                    return {"success": False, "error": "Token not found"}, 404
                user = Users.query.filter_by(id=token.user_id).first()

            logs = ActionLogs.query.filter_by(userId=user_id).all()
            if not logs:
                return {"success": False, "error": "No action logs found for this user"}, 404

            if user.type != "admin" and user.id != user_id:
                return {"success": False, "error": "Permission denied"}, 403

            logs_data = [log.to_dict() for log in logs]
            return {"success": True, "data": logs_data}, 200
        except Exception as e:
            return {"success": False, "error": str(e)}, 500
