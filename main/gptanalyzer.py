from flask import Flask, render_template, request, jsonify
import openai
import os

app = Flask(__name__)

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Route to serve the home page
@app.route('/')
def home():
    return render_template('main.html')  # Renders the main.html from the templates folder

# Route to serve the scan page
@app.route('/scan')
def scan():
    return render_template('scan.html')  # Renders the scan.html from the templates folder

# Route to serve the about page
@app.route('/about')
def about():
    return render_template('about.html')  # Renders the about.html from the templates folder

# Route to handle AI analysis
@app.route('/analyze', methods=['POST'])
def analyze_item():
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

if __name__ == '__main__':
    app.run(debug=True)
