import requests
import pandas as pd
import time

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

def scan_with_keys(APIKeys, start_index):

    APIKeyUsed = APIKeys[0]
    KeysUsed = 0
    names_pieces = []

    df = pd.read_csv("NewExoticData.txt", sep=" ", header=None, names=["Hex", "Piece", "uuid"])
    total_rows = df.shape[0]

    index = start_index
    while True:
        id = df['uuid'][index]
        
        PlayerData = FindPlayerStatusWithUUID(id, APIKeyUsed)
        
        if PlayerData['success'] == False:
            KeysUsed += 1
            
            if KeysUsed == len(APIKeys):
                break
            
            APIKeyUsed = APIKeys[KeysUsed]
            PlayerData = FindPlayerStatusWithUUID(id, APIKeyUsed)
            
        
        if PlayerData['session']['online']:
            name = UUIDtoIGN(id)
            text = f"\nPlayer {name} is online and has {df['Piece'][index]} with hex {df['Hex'][index]} @everyone"
            print(text)
            names_pieces.append(name)

        else:
            print(index, end = ' ')

        index += 1
        if index == total_rows:
            index = 0
            
    print('finished scanning')    
    return (names_pieces, index)





def check_valid_key(APIKey):
    
    req = requests.get(f"https://api.hypixel.net/status?key={APIKey}&uuid=1963156742de41cbb16db192dcb4f54e")
    redq = req.json()
    
    try:
        name = redq["session"]["online"]
    except Exception as e:
        return False
    
    return True


def run():
    keys = ['4a4f9aa5-800d-4ee1-a61f-f9133ba5259e']

    people_found = []

    start_index = 58320

    for i in range(1, 100):
        
        data = scan_with_keys(keys, start_index)
        people = data[0]
        end_index = data[1]
        
        people_found.append(people)

        
        print(people_found)
        
        while True:
            if check_valid_key(keys[0]):
                print('Key is valid')
                start_index = end_index
                break
            else:
                time.sleep(30)
        
def check_if_key_valid(key):
    req = requests.get(f"https://api.hypixel.net/status?key={key}&uuid=dee0003700fb4329878119ed84f943f7")
    return req.json()['success']

print(check_if_key_valid('d6ed2284-f8f0-41c2-9ead-59b1a577ff3e'))