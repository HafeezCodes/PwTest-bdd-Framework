# ==========================================
# features/login.feature 
# ==========================================

Feature: Login Page Verification

  Background:
    Given the user navigates to the "login" page

  Scenario: Verify Free Access link opens in new tab
    When the user clicks on the link "Free Access to InterviewQues/ResumeAssistance/Material"
    Then a new tab opens with URL "https://rahulshettyacademy.com/documents-request"
    When the user switches to the previous tab
    Then the current URL is "https://rahulshettyacademy.com/loginpagePractise/"

  Scenario: Login with Admin role
    When the user enters "APP_USERNAME" in the "Username" field
    And the user enters "APP_PASSWORD" in the "Password" field
    And the user selects the "Admin" radio button
    And the user selects "Student" from the "User Type" dropdown
    And the user checks the "I Agree to the terms and conditions" checkbox
    And the user clicks on the "Sign In" button
    Then the user logs in successfully and navigates to url "https://rahulshettyacademy.com/angularpractice/shop"

  Scenario: Login with User role and modal confirmation
    When the user enters "APP_USERNAME" in the "Username" field
    And the user enters "APP_PASSWORD" in the "Password" field
    And the user selects the "User" radio button
    Then the "User Role Warning" modal appears
    When the user clicks on the "Okay" button in the "User Role Warning" modal
    Then the "User Role Warning" modal disappears
    When the user selects "Teacher" from the "User Type" dropdown
    And the user checks the "I Agree to the terms and conditions" checkbox
    And the user clicks on the "Sign In" button
    Then the user logs in successfully and navigates to url "https://rahulshettyacademy.com/angularpractice/shop"

  Scenario: Cancel User role selection via modal
    When the user selects the "User" radio button
    Then the "User Role Warning" modal appears
    When the user clicks on the "Cancel" button in the "User Role Warning" modal
    Then the "User Role Warning" modal disappears
    And the "Admin" radio button is selected

  Scenario: Verify empty credentials validation
    When the user clicks on the "Sign In" button
    Then an error message is displayed with text "Empty username/password."
