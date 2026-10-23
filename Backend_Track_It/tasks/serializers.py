from rest_framework import serializers
from .models import Workspace, Task

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ('id', 'name', 'created_at', 'updated_at')
        read_only_fields = ('user', 'created_at', 'updated_at')

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            'id', 'workspace', 'title', 'description', 
            'due_date', 'status', 'started_at', 'completed_at', 
            'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')

    def validate_workspace(self, workspace):
        # Ensure the user only creates tasks inside workspaces they own
        request = self.context.get('request')
        if workspace.user != request.user:
            raise serializers.ValidationError("You do not own this workspace.")
        return workspace