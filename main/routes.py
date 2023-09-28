from flask import render_template, url_for, flash, redirect, request
from main import app, db, bcrypt
from main.forms import SignForm, LoginForm
from main.models import User, Course
from flask_login import login_user, current_user, logout_user, login_required

@app.route("/")
@app.route("/home")
def home():
    return render_template('home.html')


@app.route("/signup", methods=['GET', 'POST'])
def signup(): # signup route

    if current_user.is_authenticated: # check if user already login
        return redirect(url_for('home'))
    
    form = SignForm()

    if form.validate_on_submit():# check if inout is valid

        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')# hash password
        user = User(username = form.username.data, email = form.email.data, password = hashed_password)# create user object
        db.session.add(user)# add user to database
        db.session.commit()# commit changes
        flash(f'Your account has been created! You are now able to log in!', 'success')# flash success message
        return redirect(url_for('login'))# redirect to login page
    return render_template('signup.html', title='Register', form=form)


@app.route("/login", methods=['GET', 'POST'])
def login(): # login route

    if current_user.is_authenticated:# check if user already login
        return redirect(url_for('home'))
    
    form = LoginForm()

    if form.validate_on_submit(): # check if inout is valid

        user = User.query.filter_by(email=form.email.data).first() # check if user exist
        if user and bcrypt.check_password_hash(user.password, form.password.data): # check if password is correct
            login_user(user, remember=form.remember.data) # login user
            next_page = request.args.get('next') # take user to next_page if it exist, else it will be null

            return redirect(next_page) if next_page else redirect(url_for('home'))# redirect to next_page if it exist else redirect to home
        
        else:
            flash('Login Unsuccessful. Please check email and password', 'danger')# flash error message
    return render_template('login.html', title='Login', form=form)

@app.route("/logout")
def logout():
    logout_user()#Logout user and return them to the home screen
    return redirect(url_for('home'))

@app.route('/account')
@login_required #Need user to login to access this route
def account():
    return render_template('account.html', title='Account')

@app.route('/authorized')
def authorized():
    return current_user.is_authenticated