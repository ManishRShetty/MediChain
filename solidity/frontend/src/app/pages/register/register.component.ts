import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Web3 from 'web3';
import { endPoint, REGISTER } from '../../constants/api-constants';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';  // ✅ Correct import

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, RouterModule]  // ✅ Use RouterModule instead of Router
})
export class RegisterComponent {
  web3: Web3 | undefined;
  userAddress: string | null = null;
  name: string = '';
  address: string = '';

  constructor(private http: HttpClient, private router: Router) {  // ✅ Inject Router
    this.initWeb3();
  }

  async initWeb3() {
    if ((window as any).ethereum) {
      this.web3 = new Web3((window as any).ethereum);
      
      try {
        const accounts = await this.web3.eth.getAccounts();
        if (accounts.length > 0) {
          this.userAddress = accounts[0]; // ✅ Use already connected account
        } else {
          await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          const newAccounts = await this.web3.eth.getAccounts();
          this.userAddress = newAccounts[0];
        }
      } catch (error) {
        console.error('User denied MetaMask access', error);
      }
    } else {
      console.error('MetaMask not detected!');
      alert('MetaMask is required to register.');
    }
  }
  
  registerWithMetaMask() {
    if (!this.name || !this.address) {
      alert('Please enter all details.');
      return;
    }

    if (!this.userAddress) {
      alert('Please connect MetaMask.');
      return;
    }

    const apiUrl = `${endPoint}${REGISTER}`;
    const userData = {
      name: this.name,
      address: this.address,
      wallet_address: this.userAddress
    };

    this.http.post(apiUrl, userData).subscribe({
      next: (response) => {
        alert('User registered successfully!');  
        this.router.navigate(['/login']);  // ✅ Fixed navigation
      },
      error: (error) => {
        console.error('Registration failed:', error);
        alert('Registration failed. Please try again.');
      }
    });
  }
}
