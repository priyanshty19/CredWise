# Google Colab Integration Setup

## Environment Variables Required

Add these environment variables to your deployment:

\`\`\`env
COLAB_ENDPOINT_URL=https://your-colab-endpoint.ngrok.io
COLAB_API_KEY=your-colab-api-key
\`\`\`

## Google Colab Setup

1. **Upload the Python script** from the attachment to your Google Colab notebook
2. **Install required dependencies** in Colab:
   \`\`\`python
   !pip install pandas openpyxl xlrd PyPDF2 flask flask-cors
   \`\`\`

3. **Set up ngrok tunnel** for public access:
   \`\`\`python
   !pip install pyngrok
   from pyngrok import ngrok
   
   # Start ngrok tunnel
   public_url = ngrok.connect(5000)
   print(f"Public URL: {public_url}")
   \`\`\`

4. **Run the Flask server** in Colab:
   \`\`\`python
   from flask import Flask, request, jsonify
   from flask_cors import CORS
   import threading
   
   app = Flask(__name__)
   CORS(app)
   
   @app.route('/process', methods=['POST'])
   def process_document():
       # Your processing logic here
       return jsonify({"success": True, "data": processed_data})
   
   @app.route('/status', methods=['GET'])
   def status():
       return jsonify({"status": "online", "message": "Colab service is running"})
   
   # Run in background thread
   threading.Thread(target=lambda: app.run(host='0.0.0.0', port=5000)).start()
   \`\`\`

## Security Considerations

- Use API keys for authentication
- Validate file types and sizes
- Implement rate limiting
- Sanitize file contents before processing
- Use HTTPS endpoints only

## Testing

1. Check Colab status using the "Check Status" button
2. Upload a sample Excel/CSV file
3. Verify the AI processing works correctly
4. Check that charts render properly

## Troubleshooting

- **Timeout errors**: Increase processing timeout in the server action
- **Connection errors**: Verify ngrok tunnel is active
- **File parsing errors**: Check file format compatibility
- **Memory errors**: Reduce file size or optimize Colab processing
