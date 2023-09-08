from flask import Blueprint, request, jsonify
import requests

viacep = Blueprint('viacep', __name__)

@viacep.route('/get_address/<zip_code>', methods=['GET'])
def get_address(zip_code):
    print(zip_code)

    if not zip_code:
        return jsonify({'error': 'CEP not provided'}), 400

    response = requests.get(f'https://viacep.com.br/ws/{zip_code}/json/')
    data = response.json()

    print(data)

    return jsonify(data)
