document.getElementById("signupForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!fullname || !email || !phone || !password || !confirmPassword) {
        alert("Please fill all required fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Creating Account...";
    submitBtn.disabled = true;

    try {
        // 1. Create Account
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, email, phone, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        // 2. Save Token
        localStorage.setItem('token', data.token);
        
        // 3. Initiate Payment
        submitBtn.textContent = "Processing Payment...";
        
        FlutterwaveCheckout({
            public_key: "FLWPUBK_TEST-527b64aa21c2dd1ec10c123bbf274399-X",
            tx_ref: "skillhub-" + Date.now(),
            amount: 5000,
            currency: "NGN",
            payment_options: "card,banktransfer,ussd",
            customer: {
                email: email,
                phone_number: phone,
                name: fullname
            },
            customizations: {
                title: "SkillHub Enrollment",
                description: "Payment for SkillHub training enrollment",
                logo: "../skillhub_logo.png"
            },
            callback: function(payment) {
                // Payment Successful
                // We could verify payment on backend here, but for now redirect
                window.location.href = "student-dashboard.html";
            },
            onclose: function() {
                alert("Payment was cancelled. Your account has been created, please login to continue.");
                window.location.href = "login2.html";
            }
        });

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
});
