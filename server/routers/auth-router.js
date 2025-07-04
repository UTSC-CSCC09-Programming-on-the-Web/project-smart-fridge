"use strict";

const express = require('express');
const passport = require('passport');

const {
  handleGoogleSuccess,
  handleGoogleFailure,
  handleLogout,
  getCurrentUser,
} = require('../controllers/auth-controller');

const router = express.Router();

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/google/failure',
}), handleGoogleSuccess);

router.get('/google/failure', handleGoogleFailure);

router.get('/logout', handleLogout);

router.get('/current-user', getCurrentUser);

module.exports = router;