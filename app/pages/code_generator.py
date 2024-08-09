import streamlit as st
from app.utils.api import generate_response

def code_generator_page():
    st.markdown("<h2>Code Generator</h2>", unsafe_allow_html=True)
    prompt = st.text_area("Enter your prompt here:")

    if "history" not in st.session_state:
        st.session_state.history = []

    if st.button("Generate Code"):
        response = generate_response(prompt, st.session_state.history)
        if response:
            st.text_area("Generated Code:", response, height=300)

