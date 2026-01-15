import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' 
})
export class AuthService {


  setUserAddress(userAddress: string, userRole: String): void {
    document.cookie = `user_address=${userAddress}; user_role=${userRole}; path=/; max-age=186400`; 
  }

 
  getUserAddress(): string | null {
    const match = document.cookie.match(/(^| )user_address=([^;]+)/);
    return match ? match[2] : null;
  }

  getUserRole(): String | null {
    const match = document.cookie.match(/(^| )user_role=([^;]+)/);
    return match ? match[2] : null;
  }


  clearUserAddress(): void {
    document.cookie = `user_address=; user_role=; path=/; max-age=0`; 
  }
}
