import requests
import json
import hashlib
import hmac
import threading
import time
from flask import Flask, request, jsonify
import sys

# 設定
API_BASE_URL = "http://localhost:4000"  # サーバーのベースURL（適宜変更）
# 複数のAPIキーリスト
API_KEYS = [
    "e3a9f1b24c7d5896a12e9b4c8d3f6a01",
    "7c4e12a9b8d3f6e7c91f283ab47d90ce",
    "b2f5a6011c4d7e3a8f9b2d0c7364e8ab"
]
API_KEY = API_KEYS[0]  # デフォルトは最初のキー
WEBHOOK_SECRET = "test"  # Webhookの検証に使用する秘密鍵
WEBHOOK_PORT = 5000  # Webhookを受け取るポート

# APIキー選択
def select_api_key():
    print("利用可能なAPIキー:")
    for i, key in enumerate(API_KEYS):
        print(f"{i+1}. {key}")
    
    try:
        selection = int(input("使用するAPIキーの番号を選択してください (1-3) [デフォルト: 1]: ") or "1")
        if 1 <= selection <= len(API_KEYS):
            return API_KEYS[selection-1]
        else:
            print("無効な選択です。デフォルトのAPIキーを使用します。")
            return API_KEYS[0]
    except ValueError:
        print("無効な入力です。デフォルトのAPIキーを使用します。")
        return API_KEYS[0]

# Flaskアプリケーションの設定
app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook_receiver():
    """Webhookを受け取るエンドポイント"""
    if request.headers.get('Content-Type') == 'application/json':
        data = request.json
        signature = request.headers.get('X-Webhook-Signature')
        
        # シグネチャの検証
        computed_signature = hmac.new(
            WEBHOOK_SECRET.encode(), 
            json.dumps(data).encode(), 
            hashlib.sha256
        ).hexdigest()
        
        if signature == computed_signature:
            print("\n✅ 有効なWebhookを受信:")
            print(f"イベントタイプ: {data.get('event')}")
            print(f"タイムスタンプ: {data.get('timestamp')}")
            print(f"データ: {json.dumps(data.get('data'), indent=2, ensure_ascii=False)}")
            return jsonify({"status": "success"}), 200
        else:
            print("\n❌ 署名が無効なWebhookを受信")
            return jsonify({"status": "invalid signature"}), 403
    else:
        return jsonify({"status": "invalid content type"}), 400

def start_webhook_server():
    """Webhookサーバーを起動"""
    print(f"📡 Webhookサーバーを起動中... (http://localhost:{WEBHOOK_PORT}/webhook)")
    app.run(host='0.0.0.0', port=WEBHOOK_PORT, debug=False)

def register_webhook(api_key):
    """Webhookを登録"""
    webhook_url = f"http://localhost:{WEBHOOK_PORT}/webhook"
    
    response = requests.post(
        f"{API_BASE_URL}/api/webhooks",
        headers={
            "Content-Type": "application/json",
            "X-API-Key": api_key
        },
        json={
            "url": webhook_url,
            "secret": WEBHOOK_SECRET,
            "description": "Pythonテスト用Webhook",
            "events": ["new_chart", "update_chart"]  # 監視するイベント
        }
    )
    
    if response.status_code == 201:
        data = response.json()
        webhook_id = data.get('id')
        print(f"✅ Webhook登録成功！ ID: {webhook_id}")
        return webhook_id
    else:
        print(f"❌ Webhook登録失敗: {response.status_code}")
        print(response.text)
        return None

def list_webhooks(api_key):
    """登録されているWebhook一覧を取得"""
    response = requests.get(
        f"{API_BASE_URL}/api/webhooks",
        headers={"X-API-Key": api_key}
    )
    
    if response.status_code == 200:
        data = response.json()
        webhooks = data.get('data', [])
        print(f"\n📋 登録Webhook一覧 ({len(webhooks)}件):")
        for webhook in webhooks:
            print(f"ID: {webhook.get('_id')}")
            print(f"URL: {webhook.get('url')}")
            print(f"説明: {webhook.get('description')}")
            print(f"イベント: {', '.join(webhook.get('events', []))}")
            print("---")
        return webhooks
    else:
        print(f"❌ Webhook一覧取得失敗: {response.status_code}")
        print(response.text)
        return []

def delete_webhook(webhook_id, api_key):
    """Webhookを削除"""
    response = requests.delete(
        f"{API_BASE_URL}/api/webhooks/{webhook_id}",
        headers={"X-API-Key": api_key}
    )
    
    if response.status_code == 200:
        print(f"✅ Webhook削除成功 (ID: {webhook_id})")
        return True
    else:
        print(f"❌ Webhook削除失敗: {response.status_code}")
        print(response.text)
        return False

def main():
    # APIキーの選択
    selected_api_key = select_api_key()
    print(f"選択されたAPIキー: {selected_api_key[:8]}...")
    
    # Webhookサーバーをバックグラウンドで起動
    server_thread = threading.Thread(target=start_webhook_server)
    server_thread.daemon = True
    server_thread.start()
    
    # 少し待機してサーバーが起動するのを待つ
    time.sleep(1)
    
    try:
        # Webhookを登録
        webhook_id = register_webhook(selected_api_key)
        
        if webhook_id:
            # 登録されているWebhookを一覧表示
            list_webhooks(selected_api_key)
            
            print("\n🔍 Webhookの動作確認方法:")
            print("1. アプリケーションで新譜面を登録またはアップデートする")
            print("2. このコンソールにWebhook通知が表示されることを確認")
            print("\n⏳ Webhook通知を待機しています...")
            print("Ctrl+Cで終了すると、登録したWebhookは自動的に削除されます\n")
            
            # ユーザーが操作するために待機
            while True:
                time.sleep(1)
        else:
            print("\n❌ Webhookの登録に失敗したため、プログラムを終了します")
            sys.exit(1)
        
    except KeyboardInterrupt:
        # ユーザーが中断した場合、登録したWebhookを削除
        if webhook_id:
            delete_webhook(webhook_id, selected_api_key)
        print("\n👋 プログラムを終了しました")

if __name__ == "__main__":
    main()