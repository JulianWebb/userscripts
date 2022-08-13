// ==UserScript==
// @name        companyFilter
// @namespace   https://julianwebb.ca/userscripts/jobbank
// @version     0.1
// @author      Julian Webb
// @description Adds functionality to allow Users to filter specific companies from search results
// @match 		  https://www.jobbank.gc.ca/*
// @icon        https://www.jobbank.gc.ca/themes-sat/assets/favicon.ico
// @grant       none
// @noframes
// ==/UserScript==

const name = "[Company Filter] "

const show = {
  log(message) {
  	console.log(name + message);
  },
  warn(message) {
    console.warn(name + message);
  },
  error(message) {
    console.error(name + message);
  } 
}

function appendStylesheet() {
  const scriptStyle = document.createElement("style");
  scriptStyle.type = "text/css";
  scriptStyle.textContent = `.float.job-action.filter { right: 64px; }
.float.job-action.filter > a { background-image: url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE0LjI3NzUgOS44MjYyYy0uNzU4NyAyLjE1MDMtMy40OTY4IDMuNjc3NC00LjY5MjYgNC4wMDA1bDguMDA1MSAyLjA5MXMtMi41MDEzLTIuNTMyNS0xLjA4OS01Ljg0MzhjMS45NjcxLTMuOTcwNCA1LjE5NzgtOC45OTggMi4zNTE3LTkuODg2Ny0zLjAzMDMtLjk0NjItMy42MjY3IDYuOTUxLTQuNTc1MiA5LjYzOVptNC4xODU0IDcuNzM2NUw4LjA0NjEgMTQuNzQxMmMtLjE5NDkgMS4xOTc2LTEuMDI2NSAzLjc5MTgtMi43OTM3IDQuNTg3NS0xLjc2NzEuNzk1Ny0xLjI4NSAxLjYwMzYtLjgyMyAxLjkwOCAyLjE1ODUuNjgzNCA2Ljk5MDggMi4xODQyIDkuMDUyNSAyLjcyIDIuMDYxNy41MzU5IDQuMTc5Ny00LjAzOTQgNC45ODEtNi4zOTRaIiBzdHJva2U9IiM2NzM2MDgiIC8+PC9zdmc+'); }
.float.job-action.filter > a:hover { background-image: url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE0LjI3NzUgOS44MjYyYy0uNzU4NyAyLjE1MDMtMy40OTY4IDMuNjc3NC00LjY5MjYgNC4wMDA1bDguMDA1MSAyLjA5MXMtMi41MDEzLTIuNTMyNS0xLjA4OS01Ljg0MzhjMS45NjcxLTMuOTcwNCA1LjE5NzgtOC45OTggMi4zNTE3LTkuODg2Ny0zLjAzMDMtLjk0NjItMy42MjY3IDYuOTUxLTQuNTc1MiA5LjYzOVptNC4xODU0IDcuNzM2NUw4LjA0NjEgMTQuNzQxMmMtLjE5NDkgMS4xOTc2LTEuMDI2NSAzLjc5MTgtMi43OTM3IDQuNTg3NS0xLjc2NzEuNzk1Ny0xLjI4NSAxLjYwMzYtLjgyMyAxLjkwOCAyLjE1ODUuNjgzNCA2Ljk5MDggMi4xODQyIDkuMDUyNSAyLjcyIDIuMDYxNy41MzU5IDQuMTc5Ny00LjAzOTQgNC45ODEtNi4zOTRaIiBzdHJva2U9IiM2NzM2MDgiIGZpbGw9IiM2NzM2MDgiIC8+PC9zdmc+'); }`;
  document.head.appendChild(scriptStyle); 
}

function fetchFilterList() {
	const filterList = JSON.parse(localStorage.getItem("companyFilter"));
  
  return filterList? filterList: [];
}


function appendFilterList(businessName) {
 	let filterList = fetchFilterList();
  filterList.push(businessName);
  
  localStorage.setItem("companyFilter", JSON.stringify(filterList));
  return filterList;
}

function processButton(event) {
  const business = event.target.getAttribute("data-business");
  appendFilterList(business);

  show.log(`Removing '${business}' results`);
  const allResults = document.querySelectorAll(".results-jobs > article");
  processResultList(allResults);
}

function createFilterButton(businessName) {
  const accessiblity = document.createElement("span");
  accessiblity.classList.add("wb-inv");
  accessiblity.textContent = "Filter Company";
  
  const action = document.createElement("a");
  action.appendChild(accessiblity);
  action.classList.add("favourite");
  action.setAttribute("data-business", businessName);
  
	const button = document.createElement("span");
  button.appendChild(action);
  button.classList.add("float", "job-action", "filter");
  return button;
  
}

function processResult(result) {
  const business = result.querySelector(".business").innerText;
  
  const filterList = fetchFilterList();
  if (filterList.includes(business)) {
    result.remove();
    return;
  }
}

function addFilterButton(result) {
  const business = result.querySelector(".business").innerText;
	const button = createFilterButton(business);
  button.addEventListener('click', processButton);
  result.appendChild(button);  
}

function processResultList(nodeList, addButtons = false) {
  show.log("Starting Filter");
  
  nodeList.forEach(result => {
    if (result.nodeName == "ARTICLE") {
      processResult(result);
      if (addButtons) { addFilterButton(result); }
    }
  });
  
  show.log("Finished Filter");
}

function processMutation(mutationList, observer) {
	mutationList.forEach(mutation => {
    if (mutation.type === "childList") {
    	show.log("Results updated");
      processResultList(mutation.addedNodes, true);
    }
  });
}

function registerObserver() {
	const target = document.querySelector(".results-jobs");
  const options = {
    childList: true
  }
  
  const observer = new MutationObserver(processMutation);
  observer.observe(target, options);
}
    
(async function () {
  'use strict';
  
	window.addEventListener("load", () => {
  	show.log("Loaded Userscript");
    if (window.location.toString().startsWith("https://www.jobbank.gc.ca/jobsearch")) {
      appendStylesheet();
 	    
      const initialResults = document.querySelectorAll(".results-jobs > article");
  	  processResultList(initialResults, true);
    
    	registerObserver();
    }    
  })
  
})();