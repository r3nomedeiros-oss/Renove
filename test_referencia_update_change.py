#!/usr/bin/env python3
"""
Test if UPDATE endpoint can CHANGE the referencia field
"""

import requests
import json

def test_update_change_referencia():
    """Test if UPDATE can change referencia field value"""
    base_url = "http://localhost:8001/api"
    
    print("="*70)
    print("🔍 TEST: Can UPDATE endpoint CHANGE referencia value?")
    print("="*70)
    
    # Step 1: Create a lançamento with referencia
    print("\n1️⃣ Creating lançamento with referencia 'Original Value'...")
    create_data = {
        "data": "2025-07-21",
        "turno": "A",
        "hora": "10:00",
        "orelha_kg": 2.0,
        "aparas_kg": 1.5,
        "referencia": "Original Value",
        "itens": [
            {
                "formato": "35x45",
                "cor": "Roxo",
                "pacote_kg": 12.0,
                "producao_kg": 120.0
            }
        ]
    }
    
    response = requests.post(f"{base_url}/lancamentos", json=create_data)
    if response.status_code != 200:
        print(f"❌ Failed to create lançamento: {response.status_code}")
        return False
    
    created = response.json()
    lancamento_id = created['id']
    print(f"✅ Created lançamento with ID: {lancamento_id}")
    print(f"   referencia: '{created.get('referencia')}'")
    
    # Step 2: Update the lançamento with NEW referencia value
    print("\n2️⃣ Updating lançamento with NEW referencia 'Updated Value'...")
    update_data = {
        "data": "2025-07-21",
        "turno": "A",
        "hora": "10:00",
        "orelha_kg": 2.0,
        "aparas_kg": 1.5,
        "referencia": "Updated Value",  # Trying to change referencia
        "itens": [
            {
                "formato": "35x45",
                "cor": "Roxo",
                "pacote_kg": 12.0,
                "producao_kg": 120.0
            }
        ]
    }
    
    response = requests.put(f"{base_url}/lancamentos/{lancamento_id}", json=update_data)
    if response.status_code != 200:
        print(f"❌ Failed to update lançamento: {response.status_code}")
        # Cleanup
        requests.delete(f"{base_url}/lancamentos/{lancamento_id}")
        return False
    
    print(f"✅ Update request successful")
    
    # Step 3: Retrieve and check if referencia was changed
    print("\n3️⃣ Retrieving lançamento to verify referencia change...")
    response = requests.get(f"{base_url}/lancamentos/{lancamento_id}")
    if response.status_code != 200:
        print(f"❌ Failed to retrieve lançamento: {response.status_code}")
        # Cleanup
        requests.delete(f"{base_url}/lancamentos/{lancamento_id}")
        return False
    
    retrieved = response.json()
    referencia_after_update = retrieved.get('referencia')
    
    print(f"   referencia after update: '{referencia_after_update}'")
    
    # Cleanup
    print("\n🧹 Cleaning up...")
    requests.delete(f"{base_url}/lancamentos/{lancamento_id}")
    print(f"   ✓ Deleted lançamento {lancamento_id}")
    
    # Verify result
    print("\n" + "="*70)
    if referencia_after_update == "Updated Value":
        print("✅ TEST PASSED: referencia field CAN be updated")
        print("="*70)
        return True
    else:
        print("❌ TEST FAILED: referencia field CANNOT be updated")
        print(f"   Expected: 'Updated Value'")
        print(f"   Got: '{referencia_after_update}'")
        print("\n⚠️  BUG FOUND: The PUT /api/lancamentos/{id} endpoint does NOT")
        print("   include 'referencia' in the update doc, so it cannot be changed.")
        print("   The field is preserved but cannot be updated or cleared.")
        print("="*70)
        return False

if __name__ == "__main__":
    success = test_update_change_referencia()
    exit(0 if success else 1)
