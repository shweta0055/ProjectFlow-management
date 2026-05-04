from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from users.models import User
from projects.models import Project
from tasks.models import Task


class AuthTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'

    def test_register_user(self):
        data = {
            'email': 'test@example.com',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'first_name': 'Test',
            'last_name': 'User',
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_register_password_mismatch(self):
        data = {
            'email': 'test2@example.com',
            'password': 'StrongPass123!',
            'password2': 'WrongPass123!',
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_user(self):
        User.objects.create_user(email='login@example.com', password='StrongPass123!')
        data = {'email': 'login@example.com', 'password': 'StrongPass123!'}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_invalid_credentials(self):
        data = {'email': 'nobody@example.com', 'password': 'wrong'}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProjectTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='owner@example.com', password='StrongPass123!')
        self.other_user = User.objects.create_user(email='other@example.com', password='StrongPass123!')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.url = '/api/projects/'

    def test_create_project(self):
        data = {'title': 'My Project', 'description': 'A description', 'status': 'active'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'My Project')

    def test_list_projects_only_own(self):
        Project.objects.create(owner=self.user, title='Mine')
        Project.objects.create(owner=self.other_user, title='Theirs')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_update_project(self):
        project = Project.objects.create(owner=self.user, title='Old Title')
        response = self.client.patch(f'{self.url}{project.id}/', {'title': 'New Title'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'New Title')

    def test_delete_project(self):
        project = Project.objects.create(owner=self.user, title='To Delete')
        response = self.client.delete(f'{self.url}{project.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_projects(self):
        Project.objects.create(owner=self.user, title='Alpha Project')
        Project.objects.create(owner=self.user, title='Beta Project')
        response = self.client.get(f'{self.url}?search=Alpha')
        self.assertEqual(response.data['count'], 1)

    def test_filter_by_status(self):
        Project.objects.create(owner=self.user, title='Active', status='active')
        Project.objects.create(owner=self.user, title='Done', status='completed')
        response = self.client.get(f'{self.url}?status=active')
        self.assertEqual(response.data['count'], 1)


class TaskTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='taskowner@example.com', password='StrongPass123!')
        self.project = Project.objects.create(owner=self.user, title='Task Project')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.url = '/api/tasks/'

    def test_create_task(self):
        data = {
            'project': str(self.project.id),
            'title': 'My Task',
            'description': 'Do something',
            'status': 'todo',
            'due_date': '2025-12-31'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_filter_tasks_by_status(self):
        Task.objects.create(project=self.project, title='Todo Task', status='todo')
        Task.objects.create(project=self.project, title='Done Task', status='done')
        response = self.client.get(f'{self.url}?status=todo')
        self.assertEqual(response.data['count'], 1)

    def test_cannot_create_task_for_other_project(self):
        other_user = User.objects.create_user(email='other2@example.com', password='StrongPass123!')
        other_project = Project.objects.create(owner=other_user, title='Other Project')
        data = {'project': str(other_project.id), 'title': 'Sneaky Task', 'status': 'todo'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_access(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
