#!/usr/bin/env python3
"""
Test suite for the "Referência de Produção" feature
Tests the new optional 'referencia' field in lançamentos
"""

import requests
import json
from datetime import datetime

class ReferenciaFeatureTester:
    def __init__(self, base_url: str = "http://localhost:8001/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.created_ids = []
        self.test_results = []
        
    def log_result(self, test_name: str, success: bool, details: str):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'details': details
        }
        self.test_results.append(result)
        
        icon = "✅" if success else "❌"
        print(f"{icon} {test_name}")
        print(f"   {details}\n")
        
    def test_1_create_with_referencia(self):
        """Test 1: POST /api/lancamentos with referencia field"""
        print("\n📝 Test 1: Create lançamento WITH referencia")
        
        test_data = {
            "data": "2025-07-15",
            "turno": "A",
            "hora": "10:30",
            "orelha_kg": 5.0,
            "aparas_kg": 3.0,
            "referencia": "Produção para Cliente X",
            "itens": [
                {
                    "formato": "30x40",
                    "cor": "Azul",
                    "pacote_kg": 10.0,
                    "producao_kg": 100.0
                }
            ]
        }
        
        try:
            response = self.session.post(f"{self.base_url}/lancamentos", json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                lancamento_id = data.get('id')
                self.created_ids.append(lancamento_id)
                
                # Verify referencia is returned
                if data.get('referencia') == "Produção para Cliente X":
                    self.log_result(
                        "POST /api/lancamentos with referencia",
                        True,
                        f"✓ Status 200\n   ✓ referencia returned: '{data.get('referencia')}'\n   ✓ ID: {lancamento_id}"
                    )
                    return lancamento_id
                else:
                    self.log_result(
                        "POST /api/lancamentos with referencia",
                        False,
                        f"referencia not returned correctly. Expected: 'Produção para Cliente X', Got: {data.get('referencia')}"
                    )
                    return None
            else:
                self.log_result(
                    "POST /api/lancamentos with referencia",
                    False,
                    f"Status {response.status_code}: {response.text}"
                )
                return None
                
        except Exception as e:
            self.log_result("POST /api/lancamentos with referencia", False, f"Exception: {str(e)}")
            return None
    
    def test_2_get_by_id(self, lancamento_id: str):
        """Test 2: GET /api/lancamentos/{id} to verify persistence"""
        print("📖 Test 2: Get lançamento by ID to verify referencia persistence")
        
        try:
            response = self.session.get(f"{self.base_url}/lancamentos/{lancamento_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('referencia') == "Produção para Cliente X":
                    self.log_result(
                        "GET /api/lancamentos/{id} - referencia persistence",
                        True,
                        f"✓ referencia persisted correctly: '{data.get('referencia')}'"
                    )
                    return True
                else:
                    self.log_result(
                        "GET /api/lancamentos/{id} - referencia persistence",
                        False,
                        f"referencia not persisted. Expected: 'Produção para Cliente X', Got: {data.get('referencia')}"
                    )
                    return False
            else:
                self.log_result(
                    "GET /api/lancamentos/{id} - referencia persistence",
                    False,
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result("GET /api/lancamentos/{id} - referencia persistence", False, f"Exception: {str(e)}")
            return False
    
    def test_3_get_list(self, lancamento_id: str):
        """Test 3: GET /api/lancamentos (list) to verify referencia appears"""
        print("📋 Test 3: Get lançamentos list to verify referencia appears")
        
        try:
            response = self.session.get(f"{self.base_url}/lancamentos")
            
            if response.status_code == 200:
                data = response.json()
                
                # Find our created lançamento
                found = None
                for lanc in data:
                    if lanc.get('id') == lancamento_id:
                        found = lanc
                        break
                
                if found and found.get('referencia') == "Produção para Cliente X":
                    self.log_result(
                        "GET /api/lancamentos (list) - referencia in list",
                        True,
                        f"✓ Lançamento found in list with correct referencia: '{found.get('referencia')}'"
                    )
                    return True
                elif found:
                    self.log_result(
                        "GET /api/lancamentos (list) - referencia in list",
                        False,
                        f"Lançamento found but referencia incorrect. Expected: 'Produção para Cliente X', Got: {found.get('referencia')}"
                    )
                    return False
                else:
                    self.log_result(
                        "GET /api/lancamentos (list) - referencia in list",
                        False,
                        f"Lançamento with ID {lancamento_id} not found in list"
                    )
                    return False
            else:
                self.log_result(
                    "GET /api/lancamentos (list) - referencia in list",
                    False,
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result("GET /api/lancamentos (list) - referencia in list", False, f"Exception: {str(e)}")
            return False
    
    def test_4_create_without_referencia(self):
        """Test 4: Regression - POST without referencia field"""
        print("🔄 Test 4: Regression test - Create lançamento WITHOUT referencia")
        
        test_data = {
            "data": "2025-07-16",
            "turno": "B",
            "hora": "14:00",
            "orelha_kg": 4.0,
            "aparas_kg": 2.5,
            "itens": [
                {
                    "formato": "25x35",
                    "cor": "Verde",
                    "pacote_kg": 8.0,
                    "producao_kg": 80.0
                }
            ]
        }
        
        try:
            response = self.session.post(f"{self.base_url}/lancamentos", json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                lancamento_id = data.get('id')
                self.created_ids.append(lancamento_id)
                
                # referencia should be null/None
                referencia_value = data.get('referencia')
                if referencia_value is None or referencia_value == "":
                    self.log_result(
                        "POST /api/lancamentos without referencia (regression)",
                        True,
                        f"✓ Status 200\n   ✓ referencia is null/None as expected\n   ✓ Existing behavior not broken"
                    )
                    return lancamento_id
                else:
                    self.log_result(
                        "POST /api/lancamentos without referencia (regression)",
                        False,
                        f"referencia should be null/None when omitted, but got: {referencia_value}"
                    )
                    return None
            else:
                self.log_result(
                    "POST /api/lancamentos without referencia (regression)",
                    False,
                    f"Status {response.status_code}: {response.text}"
                )
                return None
                
        except Exception as e:
            self.log_result("POST /api/lancamentos without referencia (regression)", False, f"Exception: {str(e)}")
            return None
    
    def test_5_verify_calculations(self, lancamento_id: str):
        """Test 5: Verify producao_total, perdas_total, percentual_perdas calculations"""
        print("🧮 Test 5: Verify calculations are still correct")
        
        try:
            response = self.session.get(f"{self.base_url}/lancamentos/{lancamento_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Expected values based on test_1 data
                expected_producao = 100.0
                expected_perdas = 8.0  # 5.0 + 3.0
                expected_percentual = 8.0  # (8/100)*100
                
                producao = data.get('producao_total')
                perdas = data.get('perdas_total')
                percentual = data.get('percentual_perdas')
                
                all_correct = True
                details = []
                
                if producao == expected_producao:
                    details.append(f"✓ producao_total: {producao} (correct)")
                else:
                    details.append(f"✗ producao_total: {producao} (expected {expected_producao})")
                    all_correct = False
                
                if perdas == expected_perdas:
                    details.append(f"✓ perdas_total: {perdas} (correct)")
                else:
                    details.append(f"✗ perdas_total: {perdas} (expected {expected_perdas})")
                    all_correct = False
                
                if percentual == expected_percentual:
                    details.append(f"✓ percentual_perdas: {percentual}% (correct)")
                else:
                    details.append(f"✗ percentual_perdas: {percentual}% (expected {expected_percentual}%)")
                    all_correct = False
                
                self.log_result(
                    "Calculations verification",
                    all_correct,
                    "\n   ".join(details)
                )
                return all_correct
            else:
                self.log_result(
                    "Calculations verification",
                    False,
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result("Calculations verification", False, f"Exception: {str(e)}")
            return False
    
    def cleanup(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        for lancamento_id in self.created_ids:
            try:
                response = self.session.delete(f"{self.base_url}/lancamentos/{lancamento_id}")
                if response.status_code == 200:
                    print(f"   ✓ Deleted lançamento {lancamento_id}")
                else:
                    print(f"   ⚠ Could not delete lançamento {lancamento_id}: {response.status_code}")
            except Exception as e:
                print(f"   ⚠ Error deleting lançamento {lancamento_id}: {str(e)}")
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*70)
        print("📊 REFERÊNCIA DE PRODUÇÃO FEATURE - TEST SUMMARY")
        print("="*70)
        
        passed = sum(1 for r in self.test_results if r['success'])
        failed = sum(1 for r in self.test_results if not r['success'])
        total = len(self.test_results)
        
        print(f"\nTotal Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['test']}")
                    print(f"     {result['details']}")
        
        success_rate = (passed / total * 100) if total > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! The referencia feature is working correctly.")
        else:
            print("\n⚠️  SOME TESTS FAILED. Please review the issues above.")
        
        print("="*70)
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("="*70)
        print("🚀 TESTING: Referência de Produção Feature")
        print("="*70)
        print(f"Backend URL: {self.base_url}")
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Test 1: Create with referencia
            lancamento_id_1 = self.test_1_create_with_referencia()
            
            if lancamento_id_1:
                # Test 2: Get by ID
                self.test_2_get_by_id(lancamento_id_1)
                
                # Test 3: Get list
                self.test_3_get_list(lancamento_id_1)
                
                # Test 5: Verify calculations
                self.test_5_verify_calculations(lancamento_id_1)
            
            # Test 4: Create without referencia (regression)
            self.test_4_create_without_referencia()
            
        finally:
            # Always cleanup
            self.cleanup()
        
        # Print summary
        self.print_summary()
        
        # Return success status
        return all(r['success'] for r in self.test_results)

if __name__ == "__main__":
    tester = ReferenciaFeatureTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)
