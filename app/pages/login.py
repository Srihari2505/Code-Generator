import streamlit as st
from app.database.user import authenticate_user, register_user, setup_database

def login_page():
    st.markdown(
        """
        <style>
        .login-box {
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .login-box h2 {
            color: #4CAF50;
        }
        .stButton>button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        }
        .stButton>button:hover {
            background-color: #45a049;
        }
        </style>
        """,
        unsafe_allow_html=True
    )
    
    st.markdown("<div class='login-box'><h2>Login / Register</h2>", unsafe_allow_html=True)

    if 'register_mode' not in st.session_state:
        st.session_state.register_mode = False

    if st.session_state.register_mode:
        st.subheader("Register")
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        name = st.text_input("Name")
        email = st.text_input("Email")

        if st.button("Register"):
            if register_user(username, password, name, email):
                st.success("Registration successful!")
                st.session_state.register_mode = False
            else:
                st.error("Username already exists")

        if st.button("Go to Login"):
            st.session_state.register_mode = False

    else:
        st.subheader("Login")
        username = st.text_input("Username", key="login_username")
        password = st.text_input("Password", type="password", key="login_password")

        if st.button("Login"):
            if authenticate_user(username, password):
                st.session_state.logged_in = True
                st.session_state.username = username
                st.session_state.is_admin = username == "Srihari"  # Example check for admin role
                st.session_state.page = "main"
            else:
                st.error("Invalid username or password")

        if st.button("Register for New Account"):
            st.session_state.register_mode = True

    st.markdown("</div>", unsafe_allow_html=True)
