import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../services/auth.service';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-subscribe-page',
  template: `<p>Subscribing</p>`,
})
export class SubscribePageComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  stripePromise = loadStripe('pk_test_51RhIjZRMNCh8RfIXIvEa1AYMMAcrBUrr564NVChfGrRhjuf3SShrFQCO4P1miCF4PfDJVusNAAqYzBb0BSOx4kS500YjVCf3mC');

  ngOnInit(): void {
   this.startStripeCheckoutSession();
  }

    startStripeCheckoutSession(): void {
        this.authService.createCheckoutSession().subscribe({
            next: (res) => {
            this.redirectToStripeCheckout(res.sessionId);
            },
            error: (err) => {
            console.error('HTTP error while creating checkout session:', err);
            }
        });
    }

    private redirectToStripeCheckout(sessionId: string): void {
        this.stripePromise.then((stripe) => {
            if (!stripe) {
            console.error('Stripe.js not loaded.');
            return;
            }

            stripe.redirectToCheckout({ sessionId })
            .then((result) => {
                if (result.error) {
                console.error('Stripe redirect error:', result.error.message);
                }
            })
            .catch((err) => {
                console.error('Stripe redirect failure:', err);
            });
        });
    }
}