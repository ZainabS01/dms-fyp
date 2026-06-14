async function test() {
  try {
    const res = await fetch("https://dms-backend-u0h3.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "zainabshafique.pk@gmail.com",
        password: "znbshafiq"
      })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.log("Error:", err);
  }
}
test();
