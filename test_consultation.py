import requests
import json

BASE_URL = "http://localhost:3000"

def test_api():
    print("--- DÉBUT DU TEST ---")
    try:
        # 1. Vérifier les fournisseurs disponibles
        print("1. Récupération des fournisseurs...")
        f_resp = requests.get(f"{BASE_URL}/fournisseurs")
        fournisseurs = f_resp.json()
        if not fournisseurs:
            print("Aucun fournisseur trouvé.")
            return
        fid = fournisseurs[0].get('idFournisseur')
        print(f"   Trouvé: {fournisseurs[0].get('RaisonSocial')} (ID: {fid})")

        # 2. Vérifier les lots disponibles
        print("2. Récupération des lots...")
        l_resp = requests.get(f"{BASE_URL}/lots")
        lots = l_resp.json()
        if not lots:
            print("Aucun lot trouvé.")
            return
        lid = lots[0].get('numblot')
        print(f"   Trouvé: Lot {lid}")

        # 3. Tester la création
        print(f"3. Tentative d'insertion : Lot={lid}, Fournisseur={fid}")
        payload = {
            "numbLot": str(lid),
            "idFournisseur": int(fid),
            "DateConsultation": "2024-05-06"
        }
        
        c_resp = requests.post(
            f"{BASE_URL}/consultations", 
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        if c_resp.status_code in [200, 201]:
            print("✅ SUCCÈS : Consultation créée !")
            print(json.dumps(c_resp.json(), indent=2))
        else:
            print(f"❌ ÉCHEC : Code {c_resp.status_code}")
            print(f"Réponse : {c_resp.text}")

    except Exception as e:
        print(f"🚨 ERREUR : {str(e)}")

if __name__ == "__main__":
    test_api()
