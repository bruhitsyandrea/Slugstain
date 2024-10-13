from flask import Flask, request, jsonify
import openai
import os

# Initialize the Flask app
app = Flask(__name__)

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Define a route to handle the item analysis requests
@app.route('/analyze', methods=['POST'])
def analyze_item():
    # Get the item from the request data
    data = request.json
    item = data.get('item', '')

    # Use OpenAI to analyze the item
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": item}]
        )
        result = response['choices'][0]['message']['content']
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve your HTML files
@app.route('/')
def home():
    return app.send_static_file('main.html')

@app.route('/scan')
def scan():
    return app.send_static_file('scan.html')

@app.route('/about')
def about():
    return app.send_static_file('about.html')

if __name__ == '__main__':
    app.run(debug=True)