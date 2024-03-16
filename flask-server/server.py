from flask import Flask
import requests
import pandas as pd

app = Flask(__name__)

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

    APIKeyUsed = APIKeys[0]
    KeysUsed = 0
    names_pieces = []

    df = pd.read_csv("NewExoticData.txt", sep=" ", header=None, names=["Hex", "Piece", "uuid"])


    StartIndex = 10_050

    for index, id in enumerate(df['uuid'][StartIndex:]):
        
        PlayerData = FindPlayerStatusWithUUID(id, APIKeyUsed)
        
        if PlayerData['success'] == False:
            KeysUsed += 1
            
            if KeysUsed == len(APIKeys):
                break
            
            APIKeyUsed = APIKeys[KeysUsed]
            PlayerData = FindPlayerStatusWithUUID(id, APIKeyUsed)
        
        if PlayerData['session']['online']:
            name = UUIDtoIGN(id)
            text = f"\nPlayer {name} is online and has {df['Piece'][index + StartIndex + 1]} with hex {df['Hex'][index + StartIndex + 1]} @everyone"
            print(text)
            names_pieces.append(name)

        else:
            print(index, end = ' ')
    
    print('finished scanning')    
    return names_pieces


@app.route("/search")
def search():
    users = scan_with_keys(['bfa1651d-fba7-4a2a-9eae-e0e4a6891fc6'])
    
    return {'users': users}


if __name__ == "__main__":
    app.run(debug=True)
