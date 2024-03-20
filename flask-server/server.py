from flask import Flask, request
import requests
import pandas as pd
import duckdb

app = Flask(__name__)

should_stop = False


def UUIDtoIGN(UUID):
    r = requests.get(f"https://api.ashcon.app/mojang/v2/user/{UUID}")
    rdata = r.json()
    
    try:
        name = rdata["username"]
    except Exception as e:
        return 'Invalid UUID / Name Search Error'
    
    return name

def FindPlayerStatusWithUUID(uuid, APIKey):

    # requests
    req = requests.get(f"https://api.hypixel.net/status?key={APIKey}&uuid={uuid}")
    redq = req.json()
    
    return redq

def scan_with_keys(APIKeys):

    global should_stop

    APIKeyUsed = APIKeys[0]
    KeysUsed = 0
    names_pieces = []

    df = pd.read_csv("NewExoticData.txt", sep=" ", header=None, names=["Hex", "Piece", "uuid"])


    StartIndex = 0

    for index, id in enumerate(df['uuid'][StartIndex:]):
        
        
        
        PlayerData = FindPlayerStatusWithUUID(id, APIKeyUsed)
        
        if PlayerData['success'] == False:
            KeysUsed += 1
           
            if KeysUsed == len(APIKeys):
                break
              
            APIKeyUsed = APIKeys[KeysUsed]
            PlayerData = FindPlayerStatusWithUUID(id, APIKeyUsed)
            
        if should_stop:
            print('Stopping process')
            should_stop = False  # Reset the stop flag
            break
        
        try:
            if PlayerData['session']['online']:
                name = UUIDtoIGN(id)
                text = f"\nPlayer {name} is online and has {df['Piece'][index + StartIndex + 1]} with hex {df['Hex'][index + StartIndex + 1]} @everyone"
                print(text)
                names_pieces.append(name)
        except KeyError:
            print('Finished scanning due to key error')

        else:
            print(index, end = ' ')
    
    print('finished scanning')
    print(names_pieces)    
    return names_pieces



@app.route("/search")
def search():
    print('search queried')
    users = scan_with_keys(['b9ef7f08-0ac2-49b1-ba0c-6f2250ae4614', '8aa129e5-bc47-4a09-95d7-9c6aac4dbf67'])
    
    return {'users': users}

@app.route("/stop-process", methods=['POST'])
def stop_process():
    global should_stop
    should_stop = True  # Set the stop flag when this endpoint is hit
    return {'message': 'Process will be stopped'}

@app.route('/login', methods=['POST'])
def login():
    con = duckdb.connect('PBJ.duckdb')
    
    con.sql("SELECT * FROM users").show()
    
    username = request.form.get('username')
    password = request.form.get('password')  
    
    print(username, password)

    result = con.execute("""
    SELECT COUNT(*) 
    FROM users 
    WHERE username = ? AND password = ?
    """, (username, password)).fetchone()

    if result[0] > 0:
        return "Login successful", 200
    else:
        return "Invalid username or password", 401

@app.route('/add-keys', methods=['POST'])
def add_keys():
    con = duckdb.connect('PBJ.duckdb')
    
    keys = request.json.get('keys', [])
    username = request.json.get('username')
    
    if not keys or len(keys) > 5:
        return {'message': 'You must provide up to 5 API keys.'}, 400

    # Pad keys array with None values if less than 5 keys were provided
    keys += [None] * (5 - len(keys))

    # Unpack keys into separate variables
    key1, key2, key3, key4, key5 = keys
    
    print(keys, username)

    # Update keys in users table for the specified user
    con.execute("""
        UPDATE users
        SET API_KEY1 = ?, API_KEY2 = ?, API_KEY3 = ?, API_KEY4 = ?, API_KEY5 = ?
        WHERE username = ?
    """, (key1, key2, key3, key4, key5, username))

    con.sql("SELECT * FROM users").show()
    
    return {'message': 'API keys updated successfully.'}, 200


if __name__ == "__main__":
    app.run(debug=True)
