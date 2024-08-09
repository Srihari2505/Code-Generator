import streamlit as st
import sqlite3

def report_page():
    st.title("Give feedback")

    # Form for reporting an issue
    with st.form(key='report_form'):
        st.subheader("Submit Your Feedback")

        issue_title = st.text_input("Title of the Feedback")
        issue_description = st.text_area("Description of the Feedback")
        contact_email = st.text_input("Your Email")

        submit_button = st.form_submit_button("Submit")

        if submit_button:
            if issue_title and issue_description and contact_email:
                # Save report to database
                if save_report(issue_title, issue_description, contact_email):
                    st.success("Your report has been submitted successfully!")
                else:
                    st.error("There was an error submitting your report. Please try again.")
            else:
                st.error("Please fill out all fields.")

def save_report(title, description, email):
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                email TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('INSERT INTO reports (title, description, email) VALUES (?, ?, ?)', (title, description, email))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        st.error(f"An error occurred: {e}")
        return False
