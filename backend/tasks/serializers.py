from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Task
        fields = (
            'id', 'project', 'project_title', 'title', 'description',
            'status', 'due_date', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError('Title must be at least 3 characters.')
        return value.strip()

    def validate_status(self, value):
        valid = ['todo', 'in-progress', 'done']
        if value not in valid:
            raise serializers.ValidationError(f'Status must be one of: {", ".join(valid)}')
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        project = attrs.get('project') or (self.instance.project if self.instance else None)
        if project and request and project.owner != request.user:
            raise serializers.ValidationError({'project': 'You do not own this project.'})
        return attrs
