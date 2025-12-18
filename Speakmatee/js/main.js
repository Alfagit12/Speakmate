function login(){
  const val=document.getElementById("identifier").value.trim();
  if(!val){alert("Enter value");return;}

  localStorage.setItem("user",val);
  localStorage.setItem("plan","free");
  localStorage.setItem("weeklyChats",3);

  window.location.href="dashboard.html";
}
function goLogin(){
  document.querySelector(".login-card")?.scrollIntoView({
    behavior:"smooth"
  });
}
