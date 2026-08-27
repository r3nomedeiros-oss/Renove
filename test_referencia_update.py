#!/usr/bin/env python3
"""
Additional test for UPDATE endpoint with referencia field
"""

import requests
import json

def test_update_with_referencia():
    """Test if UPDATE preserves referencia field"""
    base_url = "http://localhost:8001/api"
    
    print("="*70)
    print("🔍 ADDITIONAL TEST: UPDATE endpoint with referencia")
    print("="*70)
    
    # Step 1: Create a lançamento with referencia
    print("\n1️⃣ Creating lançamento with referencia...")
    create_data = {
        "data": "2025-07-20",
        "turno": "A",
        "hora": "09:00",
        "orelha_kg": 3.0,
        "aparas_kg": 2.0,
        "referencia": "Pedido Especial ABC",
        "itens": [
            {
                "formato": "40x50",
                "cor": "Amarelo",
                "pacote_kg": 15.0,
                "producao_kg": 150.0
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
    
    # Step 2: Update the lançamento (change turno and orelha_kg)
    print("\n2️⃣ Updating lançamento (changing turno and orelha_kg)...")
    update_data = {
        "data": "2025-07-20",
        "turno": "B",  # Changed from A to B
        "hora": "09:00",
        "orelha_kg": 4.0,  # Changed from 3.0 to 4.0
        "aparas_kg": 2.0,
        "referencia": "Pedido Especial ABC",  # Including referencia in update
        "itens": [
            {
                "formato": "40x50",
                "cor": "Amarelo",
                "pacote_kg": 15.0,
                "producao_kg": 150.0
            }
        ]
    }
    
    response = requests.put(f"{base_url}/lancamentos/{lancamento_id}", json=update_data)
    if response.status_code != 200:
        print(f"❌ Failed to update lançamento: {response.status_code}")
        # Cleanup
        requests.delete(f"{base_url}/lancamentos/{lancamento_id}")
        return False
    
    updated = response.json()
    print(f"✅ Updated lançamento")
    print(f"   turno changed to: {updated.get('turno')}")
    
    # Step 3: Retrieve and check if referencia is preserved
    print("\n3️⃣ Retrieving lançamento to verify referencia preservation...")
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
    if referencia_after_update == "Pedido Especial ABC":
        print("✅ TEST PASSED: referencia field is preserved after UPDATE")
        print("="*70)
        return True
    else:
        print("❌ TEST FAILED: referencia field was LOST after UPDATE")
        print(f"   Expected: 'Pedido Especial ABC'")
        print(f"   Got: '{referencia_after_update}'")
        print("\n⚠️  BUG FOUND: The PUT /api/lancamentos/{id} endpoint does NOT")
        print("   preserve the referencia field when updating a lançamento.")
        print("="*70)
        return False

if __name__ == "__main__":
    success = test_update_with_referencia()
    exit(0 if success else 1)
