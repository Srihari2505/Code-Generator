import streamlit as st

def main_page():
    st.title("Welcome to the Intelligent Code Assistant")

    # Adding a background image
    st.markdown(
        """
        <style>
        .main-background {
            background-image: url('https://cdn.sanity.io/images/kts928pd/production/ec3bdf0af617ee1c870eea3b7630112616115163-731x731.jpg');
            background-size: cover;
            background-position: center;
            padding: 20px;
            color: #fff;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .main-container {
            background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
            border-radius: 15px;
            padding: 30px;
            max-width: 800px;
            width: 100%;
        }
        .main-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .main-image {
            width: 100%;
            border-radius: 10px;
        }
        .main-text {
            font-size: 1.2em;
            line-height: 1.6em;
        }
        </style>
        """,
        unsafe_allow_html=True
    )

    st.markdown('<div class="main-background">', unsafe_allow_html=True)
    
    st.markdown('<div class="main-container">', unsafe_allow_html=True)

    st.markdown('<h2 class="main-header">Explore the Future of Coding</h2>', unsafe_allow_html=True)
    
    # Add an attractive image
    st.markdown(
        """
        <img src='https://assets.telegraphindia.com/telegraph/2023/May/1683246985_new-project-2023-05-05t060333-430.jpg' class='main-image'>
        """,
        unsafe_allow_html=True
    )
    
    st.markdown(
        """
        <div class="main-text">
        <p>
        Welcome to the Intelligent Code Assistant, where coding meets convenience and efficiency. Our application leverages the power of Code Llama to assist you in generating code snippets, managing your profile, and enhancing your programming experience. With real-time suggestions and a user-friendly interface, we aim to make coding smoother and more productive for developers of all skill levels.
        </p>
        <p>
        Features include:
        <ul>
            <li>Effortless code generation across multiple programming languages.</li>
            <li>Seamless user authentication and profile management.</li>
            <li>Interactive UI to provide a dynamic user experience.</li>
        </ul>
        </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.markdown('</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)
