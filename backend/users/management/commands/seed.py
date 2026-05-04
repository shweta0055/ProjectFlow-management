from django.core.management.base import BaseCommand
from django.db import transaction
from users.models import User
from projects.models import Project
from tasks.models import Task
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create users
        users_data = [
            {'email': 'alice@example.com', 'password': 'Password123!', 'first_name': 'Alice', 'last_name': 'Smith'},
            {'email': 'bob@example.com', 'password': 'Password123!', 'first_name': 'Bob', 'last_name': 'Jones'},
        ]
        users = []
        for ud in users_data:
            user, created = User.objects.get_or_create(email=ud['email'], defaults={
                'first_name': ud['first_name'],
                'last_name': ud['last_name'],
            })
            if created:
                user.set_password(ud['password'])
                user.save()
            users.append(user)
            self.stdout.write(f'  User: {user.email}')

        # Create projects
        projects_data = [
            {'title': 'Website Redesign', 'description': 'Complete overhaul of the company website', 'status': 'active'},
            {'title': 'Mobile App v2', 'description': 'Second version of the mobile application', 'status': 'active'},
            {'title': 'API Migration', 'description': 'Migrate legacy API to REST', 'status': 'completed'},
        ]
        projects = []
        for pd in projects_data:
            project, created = Project.objects.get_or_create(owner=users[0], title=pd['title'], defaults=pd)
            projects.append(project)
            self.stdout.write(f'  Project: {project.title}')

        # Create tasks
        today = date.today()
        tasks_data = [
            {'project': projects[0], 'title': 'Design mockups', 'status': 'done', 'due_date': today - timedelta(days=5)},
            {'project': projects[0], 'title': 'Frontend development', 'status': 'in-progress', 'due_date': today + timedelta(days=10)},
            {'project': projects[0], 'title': 'SEO optimization', 'status': 'todo', 'due_date': today + timedelta(days=20)},
            {'project': projects[1], 'title': 'UI wireframes', 'status': 'done', 'due_date': today - timedelta(days=3)},
            {'project': projects[1], 'title': 'Backend integration', 'status': 'in-progress', 'due_date': today + timedelta(days=7)},
            {'project': projects[1], 'title': 'Testing', 'status': 'todo', 'due_date': today + timedelta(days=15)},
            {'project': projects[2], 'title': 'Endpoint mapping', 'status': 'done', 'due_date': today - timedelta(days=20)},
            {'project': projects[2], 'title': 'Documentation', 'status': 'done', 'due_date': today - timedelta(days=10)},
        ]
        for td in tasks_data:
            task, created = Task.objects.get_or_create(
                project=td['project'], title=td['title'],
                defaults={'status': td['status'], 'due_date': td['due_date']}
            )
            self.stdout.write(f'  Task: {task.title}')

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write(f'Login with: alice@example.com / Password123!')
