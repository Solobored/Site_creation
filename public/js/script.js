document.addEventListener("DOMContentLoaded", () => {
  const hamburgerMenu = document.getElementById("hamburger-menu")
  const navItems = document.getElementById("nav-items")

  if (hamburgerMenu && navItems) {
    hamburgerMenu.addEventListener("click", () => {
      navItems.classList.toggle("show")
      const isExpanded = navItems.classList.contains("show")
      hamburgerMenu.setAttribute("aria-expanded", isExpanded)
    })
  }

  // Get the "Own Today" button
  const ownTodayBtn = document.querySelector(".own-today-btn")

  // Add click event listener
  if (ownTodayBtn) {
    ownTodayBtn.addEventListener("click", () => {
      alert("Thank you for your interest in the DMC Delorean! A sales representative will contact you shortly.")
    })

    ownTodayBtn.addEventListener("mouseover", () => {
      ownTodayBtn.style.transform = "translateY(-2px)"
    })

    ownTodayBtn.addEventListener("mouseout", () => {
      ownTodayBtn.style.transform = ""
    })
  }

  // Add current year to footer if not already set by EJS
  const copyrightYear = document.querySelector(".copyright")
  if (copyrightYear && !copyrightYear.textContent.includes(new Date().getFullYear())) {
    copyrightYear.textContent = `© ${new Date().getFullYear()}, CSE Motors`
  }

  const currentPath = window.location.pathname
  const navLinks = document.querySelectorAll("#main-nav a")
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.setAttribute("aria-current", "page")
      link.parentElement.classList.add("current-page")
    }
  })

  document.addEventListener("click", (e) => {
    if (
      navItems &&
      navItems.classList.contains("show") &&
      !navItems.contains(e.target) &&
      hamburgerMenu &&
      !hamburgerMenu.contains(e.target)
    ) {
      navItems.classList.remove("show")
      hamburgerMenu.setAttribute("aria-expanded", "false")
    }
  })

  const upgradeItems = document.querySelectorAll(".upgrade-item")
  upgradeItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      item.style.transform = "translateY(-5px)"
      item.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.1)"
    })

    item.addEventListener("mouseleave", () => {
      item.style.transform = ""
      item.style.boxShadow = ""
    })
  })
})
