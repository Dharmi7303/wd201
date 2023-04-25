/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const express = require("express");
const app = express();

var csrf = require("tiny-csrf");

var cookieParser = require("cookie-parser");

const passport = require("passport");

const connectEnsureLogin = require("connect-ensure-login");

const session = require("express-session");

const flash = require("connect-flash");

const LocalStrategy = require("passport-local");

const saltRounds = 10;
const bcrypt = require("bcrypt");

const path = require("path");

const { Todo, User } = require("./models");

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser("Complete WD201 DSA and Assignments"));

app.use(csrf("123453747imamsecret987654321book", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use(flash());

app.use(
  session({
    secret: "ho-doper-secret-api-1248512542345",

    resave: false,
    saveUninitialized: false,

    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hrs
    },
  })
);

app.use(passport.initialize());

app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async function (user) {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          console.log(error);
          return done(null, false, { message: "Invalid email" });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

// get request to get all todos
app.get("/", async (req, res) => {
  res.render("index", {
    title: "Todo application",

    csrfToken: req.csrfToken(),
  });
});
//creating a new user
app.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign up", csrfToken: req.csrfToken() });
});

app.post("/users", async (req, res) => {
  if (req.body.firstName.length === 0) {
    req.flash("error", "First Name can't be Empty");
    return res.redirect("/signup");
  }

  if (req.body.email.length === 0) {
    req.flash("error", "Email Name can't be Empty");
    return res.redirect("/signup");
  }

  if (req.body.password.length === 0) {
    req.flash("error", "Password can't be Empty");
    return res.redirect("/signup");
  }
  //hash password using bcrypt

  const hasedPwd = await bcrypt.hash(req.body.password, saltRounds);

  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hasedPwd,
    });

    req.login(user, (err) => {
      if (err) {
        return res.status(422).send({ error: err.message });
      }
      res.redirect("/todos");
    });
  } catch (error) {
    req.flash("error", "Email Already Exists");
    return res.redirect("/signup");
  }

  //add user
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    csrfToken: req.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    response.redirect("/todos");
  }
);

app.get("/signout", connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const LoggedInUser = req.user.id;
  const allTodos = await Todo.getTodos(LoggedInUser);
  const dueTodayTodos = await Todo.dueToday(LoggedInUser);
  const dueLaterTodos = await Todo.dueLater(LoggedInUser);
  const overDueTodos = await Todo.overDue(LoggedInUser);
  const completedTodos = await Todo.completedItems(LoggedInUser);

  if (req.accepts("html")) {
    res.render("todos", {
      title: "Todo Apllication",
      dueTodayTodos,
      overDueTodos,
      dueLaterTodos,
      completedTodos,
      name: req.user.firstName,
      csrfToken: req.csrfToken(),
    });
  } else {
    res.json({
      allTodos,
      dueTodayTodos,
      overDueTodos,
      dueLaterTodos,
      completedTodos,
    });
  }
});

//adding a new todo using post request
app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  if (req.body.title.length == 0) {
    req.flash("error", "Title can't be Empty");
    return res.redirect("/todos");
  }

  if (req.body.dueDate.length === 0) {
    req.flash("error", "Due Date can't be empty");
    return res.redirect("/todos");
  }

  try {
    const todo = await Todo.addTodo(
      req.body.title,
      req.body.dueDate,
      req.user.id
    );

    return res.redirect("/todos");
  } catch (error) {
    console.log(error);

    return res.status(422).json(error);
  }
});

// chaging the completed status of a todo
app.put("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);

    var boolvalue = req.body.completed;

    const updatedTodo = await todo.setCompletionStatus(boolvalue);

    return res.json(updatedTodo);
  } catch (error) {
    console.log(error);

    return res.status(422).json(error);
  }
});

// delete a todo with id

// eslint-disable-next-line no-unused-vars
app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const todoID = req.params.id;

    try {
      await Todo.remove(todoID, req.user.id);
      return res.json({ success: true });
    } catch (error) {
      return res.status(422).json(error);
    }
  }
);

module.exports = app;
