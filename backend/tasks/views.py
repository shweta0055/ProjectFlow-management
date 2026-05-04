from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'project']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'status']
    ordering = ['due_date', '-created_at']

    def get_queryset(self):
        return Task.objects.filter(
            project__owner=self.request.user
        ).select_related('project')

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        task.delete()
        return Response({'detail': 'Task deleted successfully.'}, status=status.HTTP_200_OK)
