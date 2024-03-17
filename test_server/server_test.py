import requests
import pandas as pd
import sqlite3
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


    StartIndex = start_index

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
            print(index + StartIndex + 1, end = ' ')
    
    print('finished scanning')    
    return (names_pieces, index + StartIndex + 1)

#conn = sqlite3.connect('test.db')

#sers = scan_with_keys(['bfa1651d-fba7-4a2a-9eae-e0e4a6891fc6'])
    
#print({'users': users})

def check_valid_key(APIKey):
    
    req = requests.get(f"https://api.hypixel.net/status?key={APIKey}&uuid=1963156742de41cbb16db192dcb4f54e")
    redq = req.json()
    
    try:
        name = redq["session"]["online"]
    except Exception as e:
        return False
    
    return True

keys = ['b9ef7f08-0ac2-49b1-ba0c-6f2250ae4614']

people_found = []

start_index = 0

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
    
    
    
    
    