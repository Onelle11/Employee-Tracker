INSERT INTO department (name)

VALUES  ('IT'),
        ('Finance & Accounting'),
        ('Sales & Marketing'),
        ('Operations');

INSERT INTO role (title, salary, department_id)

VALUES  ('Full Stack Developer', 80000, 1),
        ('Software Engineer', 90000, 1),
        ('Accountant', 97000, 2),
        ('Financial Analyst', 75000, 2),
        ('Marketing Coordinator', 55000, 3),
        ('Sales Lead', 39000, 3),
        ('Project Manager', 70000, 4),
        ('Operations Manager', 66000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)

VALUES  ('Ana', 'Taylor', 2, null),
        ('Brooke', 'Wayne', 3, 3),
        ('Alice', 'Noir', 1, 1),
        ('Ashley', 'Moore', 4, null),
        ('Nacho', 'Man', 5, 5),
        ('Sushi', 'Cat', 6, null),
        ('Moe', 'Ray', 7, 7),
        ('Ona', 'Yuuki', 8, 8);