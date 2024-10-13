from flask import Flask, render_template, request, jsonify
import openai
import os

app = Flask(__name__)

client = openai.OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")  # Make sure your API key is set in your environment variables
)


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
    try:
        data = request.json
        item = data.get('item', '')

        if not item:
            return jsonify({'error': 'No text provided for analysis'}), 400

        # Debugging: Log received text
        print(f"Text received for analysis: {item}")

        # Send the text to GPT using the new SDK method
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{
                "role": "user",
                "content": item
            }]
        )

        # Extract and return GPT's response
        result = response.choices[0].message.content
        print(f"GPT response: {result}")
        return jsonify({'result': result})

    except Exception as e:
        print(f"Error during GPT analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)
