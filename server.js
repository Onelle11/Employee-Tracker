const mysql2 = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const { title } = require ("process");

var connection = mysql2.createConnection(
    {
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "Onelle1103",
        database: "employee_db"
    }
);

connection.connect((err) => {
    if(err) {
        console.error("Error connecting: " + err.stack);
        return;
    }
    //console.log("Connected as id " + connection.threadId);
});

const resValid = function (input) {
    if (input === "") {
        console.log("This cannot be empty!");
        return false;
    }
    return true;
};

function start() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "begin",
            choices: [
                "View all Employees",
                "View All Departments",
                "View All Roles",
                "Add Department",
                "Add Role",
                "Add Employee",
                "Update Employee Roles",
                "Exit"
            ]
        }
    ])
    .then(answer => {
        switch (answer.begin) {
            case "View all Employees":
                viewAllEmployees();
                break;
            
            case "View all Departments":
                viewAllDepartments();
                break;
            
            case "View all Roles":
                viewAllRoles();
                break;

            case "Add Department":
                addDepartment();
                break;

            case "Add Role":
                addRole();
                break;

            case "Add Employee":
                addEmployee();
                break;

            case "Update Employee Roles":
                updateEmployeeRole();
                break;

            case "Exit":
                connection.end();
                break;
        }
    });
};

function viewAllEmployees() {
    var query = "SELECT CONCAT(a.first_name, ' ', a.last_name) AS 'employee name', title, salary, name AS department, ";
    query += "CONCAT(b.first_name, ' ', b.last_name) AS manager FROM employee a LEFT JOIN employee b ON a.manager_id = b.id ";
    query += "INNER JOIN role ON a.role_id = role.id INNER JOIN department ON department_id = department.id"
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("\n----------");
        const table = cTable.getTable(res);
        console.log(table);
        start();
    });
};

function viewAllDepartments() {
    var query = "SELECT * FROM department ORDER BY id";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("\n----------");
        const table = cTable.getTable(res);
        console.log(table);
        start();
    });
};

function viewAllRoles() {
    var query = "SELECT title, salary, name AS department FROM role INNER JOIN department ON role.department_id = department.id";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("\n----------");
        const table = cTable.getTable(res);
        console.log(table);
        start();
    });
};

function addEmployee() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the employee's first name?",
            name: "firstName",
            validate: resValid
        },
        {
            type: "input",
            message: "What is the employee's last name?",
            name: "lastName",
            validate: resValid
        }
    ])
    .then(answers => {
        newEmployeeRole(answers.firstName.trim(), answers.lastName.trim());

    });
};

function newEmployeeRole(firstName, lastName) {
    connection.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: "list",
                message: "Choose a role",
                choices: () => {
                    const choices = [];
                    for (let i = 0; i < res.length; i++) {
                        choices.push(res[i].title);
                    }
                    return ([...new Set(choices)]);
                },
                name: "role"
            }
        ])
        .then (answer => {
            newEmployeeDept(answer.role, firstName, lastName);
        });
    });
};

function newEmployeeDept(role, firstName, lastName) {
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: "list",
                message: "Choose a department",
                choices: () => {
                    const choices = [];
                    for (let i = 0; i < res.length; i++) {
                        choices.push(res[i].name);
                    }
                    return choices;
                },
                name: "dept"
            }
        ])
        .then(answer => {
            addEmployee(answer.dept, role, firstName, lastName);
        });
    });
};

function addEmployee(dept, role, firstName, lastName) {
    let query = "SELECT role.id FROM role INNER JOIN department ON department_id = department.id WHERE title = ? AND name =?";
    connection.query(query, [role, dept], (err, res) => {
        if (err) {
            throw err;
        }
        role_id = res[0].id;
        connection.query("SELECT id, first_name, last_name FROM employee",
        (err, res1) => {
            if (err) throw err;

            inquirer.prompt([
                {
                    type: "list",
                    message: "Choose a manager for this employee",
                    choices: () => {
                        const choices = ["None"];
                        for (let i = 0; i < res1.length; i++) {
                            choices.push(res1[i].first_name + " " + res1[i].last_name);

                        }
                        return choices;
                    },
                    name: "manager"
                }
            ])
            .then((managerResponse) => {
                if (managerResponse.manager === "None") {
                    let query = "INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)";
                    connection.query(query, [firstName, lastName, role_id], (err, res) => {
                        if (err) throw err;

                        console.log('Added new employee with the name of ${firstName} ${lastName} to the database.');
                        start();
                    });
                } else {
                    let manager = managerResponse.manager.split(" ");
                    let managerFirstName = manager [0];
                    let managerLastName = manager [1];
                    for (let i = 0; i < res1.length; i++) {
                        if (res1[i].first_name === managerFirstName && res1[i].last_name === managerLastName) {
                            manager_id = res1[i].id;
                        }
                    }
                    let query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?)";
                    connection.query(query, [firstName, lastName, role_id, manager_id], (err, res) => {
                        if (err) throw err;

                        console.log('Added new employee with the name of ${firstName} ${lastName} to the database.');
                        start();
                    });
                }
            });
        });
    });
};

function addRole() {
    let query = "SELECT * FROM department";
    connection.query(query, (err, result) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "input",
                message: "What is the title of this role?",
                name: "title",
                validate: resValid
            },
            {
                type: "number",
                message: "What is the salary for this position? (include 2 decimal places)",
                name: "salary",
                validate: resValid
            },
            {
                type: "list",
                message: "Please choose a department",
                choices: () => {
                    const choices = [];
                    for (let i = 0; i < result.length; i++) {
                        choices.push(result[i].name);
                    }
                    return choices;
                },
                name: "department"
            }
        ])
        .then(answer => {
            let dept_id;
            for (let i = 0; i < result.length; i++) {
                if (result[i].name === answer.department) {
                    dept_id = result[i].id;
                }
            }
            query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
            connection.query(query, [answer.title, answer.salary, dept_id], (err, res) => {
                if (err) throw err;

                start();
            });
        });
    });
};

function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the department you wish to add?",
            name: "name",
            validate: resValid
        }
    ])
    .then(answer => {
        let duplicate = false;
        connection.query("SELECT * FROM department", (err, result) => {
            if (err) throw err;
            for (let i = 0; i < result.length; i++) {
                if (result[i].name === answer.name) {
                    duplicate = true;
                }
            }
            if (!duplicate) {
                var query = "INSERT INTO department (name) VALUES (?)";
                connection.query(query, [answer.name], (err, res) => {
                    if (err) throw err;

                    console.log("\n----------");
                    console.log(query);
                });
            } else {
                console.log("\n----- This department already exists! -----");
            }
            start();
        });
    });
};

function updateEmployeeRole() {
    connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        let dept = res[0].department_id;
        inquirer.prompt([
            {
                type: "list",
                message: "Which employee would you like to update?",
                choices: () => {
                    const choices = [];
                    for (let i = 0; i < res.length; i++) {
                        choices.push(res[i].first_name + " " + res[i].last_name);

                    }
                    return choices;
                },
                name: "fullName"
            }
        ])
        .then(answers => {
            connection.query("SELECT * FROM role", (err, res) => {
                if (err) throw err;

                inquirer.prompt([
                    {
                        type: "list",
                        message: "Choose a new role",
                        choices: () => {
                            const choices = [];
                            for (let i = 0; i < res.length; i++) {
                                choices.push(res[i].title);
                            }
                            return ([...new Set(choices)]);
                        },
                    }
                ])
                .then (answer => {
                    connection.query("SELECT * FROM role", (err, res) => {
                        if (err) throw err;
                        let role_id;
                        for (let i = 0; i < res.length; i++) {
                            if (answer.role === res[i].title) {
                                role_id = res[i].id;
                            }
                        }
                        let firstName = answers.fullName.split(" ")[0];
                        let lastName = answers.fullName.split(" ")[1];
                        connection.query("UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?", [role_id, firstName, lastName], (err, res) => {
                            if (err) throw err;
                            start();
                        });
                    });
                });
            });
        });
    });
};

start();