"""
FarmNexus Local Development Server & API Bridge
Runs static web server and JSON API endpoint on port 8000 using standard library http.server.
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import urllib.parse
from backend.farmnexus_agents import FarmNexusOrchestrator

orchestrator = FarmNexusOrchestrator()

class FarmNexusHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/crop-intelligence':
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length)
            
            try:
                payload = json.loads(post_body.decode('utf-8'))
                result = orchestrator.process(payload)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result, indent=2).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        # Serve static files normally
        return super().do_GET()

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, FarmNexusHandler)
    print(f"FarmNexus Server running at http://localhost:{port}/")
    print(f"API Endpoint available at POST http://localhost:{port}/api/crop-intelligence")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
