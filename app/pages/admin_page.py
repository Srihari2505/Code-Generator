import streamlit as st
import sqlite3

def admin_page():
    st.title("Admin Dashboard")

    # Connect to the database
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()

        # Display Users
        st.header("Manage Users")
        cursor.execute('SELECT username, name, email FROM users')
        users = cursor.fetchall()

        if users:
            for user in users:
                st.write(f"**Username:** {user[0]}")
                st.write(f"**Name:** {user[1]}")
                st.write(f"**Email:** {user[2]}")
                st.write("---")
        else:
            st.write("No users found.")

        st.write("--------------------")

        # Display Reports
        st.header("Manage Reports")
        cursor.execute('SELECT id, title, description, email, timestamp FROM reports ORDER BY timestamp DESC')
        reports = cursor.fetchall()

        if reports:
            for report in reports:
                st.write(f"**Report ID:** {report[0]}")
                st.write(f"**Title:** {report[1]}")
                st.write(f"**Description:** {report[2]}")
                st.write(f"**Email:** {report[3]}")
                st.write(f"**Timestamp:** {report[4]}")
                st.write("-------------------")
        else:
            st.write("No reports found.")

        conn.close()

    except Exception as e:
        st.error(f"An error occurred: {e}")
