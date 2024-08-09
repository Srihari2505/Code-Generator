import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import streamlit as st
from app.pages import code_generator, mainpage, profile, login, mainpage, report_page, admin_page
from app.database.user import setup_database, authenticate_user, register_user
from app.utils.api import generate_response

code_generator_page = code_generator.code_generator_page
profile_page = profile.profile_page
other_page = report_page.report_page
login_page = login.login_page
main_page = mainpage.main_page
# Setup database
setup_database()

def main():

    setup_database()

    if 'logged_in' not in st.session_state:
        st.session_state.logged_in = False
        st.session_state.page = 'login'
    
    if st.session_state.logged_in:
        show_navbar()
    else:
        login_page()

def show_navbar():
    st.sidebar.title("Navigation")
    
    pages = {
        "Main Page": "main",
        "Code Generator": "code_generator",
        "Profile Page": "profile",
        "Report Page": "report_page"
    }
    
    choice = st.sidebar.radio("Select a Page", options=list(pages.keys()))
    
    if choice == "Main Page":
        main_page()
    elif choice == "Code Generator":
        code_generator_page()
    elif choice == "Profile Page":
        profile_page()
    elif choice == "Report Page":
        other_page()
    if st.sidebar.button("Admin Dashboard"):
        if st.session_state.get('is_admin', False):  # Check if user is admin
            admin_page.admin_page()
        else:
            st.error("Access Denied: You are not authorized to view this page.")
    

    st.sidebar.markdown("---")
    if st.sidebar.button("Logout"):
        st.session_state.logged_in = False
        st.session_state.username = None
        st.experimental_rerun()
 

if __name__ == "__main__":
    main()
