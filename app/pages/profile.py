import streamlit as st
from PIL import Image
import sqlite3
from app.database.user import get_user_profile, update_user_profile

# Simulate a database or storage system for user details



def profile_page():
    if 'username' not in st.session_state:
        st.error("Please login first")
        return
    
    username = st.session_state.username
    profile = get_user_profile(username)
    
    if profile:
        st.header(f"Profile: {username}")

        # Display current profile picture if available
        if profile['profile_pic']:
            st.image(profile['profile_pic'], width=150)
        
        # Form to edit profile details
        with st.form(key='profile_form'):
            new_name = st.text_input("Name", value=profile['name'])
            new_email = st.text_input("Email", value=profile['email'])
            new_bio = st.text_area("Bio", value=profile['bio'] if profile['bio'] else "")
            new_profile_pic = st.file_uploader("Profile Picture", type=["png", "jpg", "jpeg"])

            if st.form_submit_button("Update Profile"):
                update_user_profile(username, new_name, new_email, new_bio, new_profile_pic)
                st.success("Profile updated successfully")
                st.experimental_rerun()  # Rerun to reflect updated data

    else:
        st.error("User profile not found")
