let names = [];
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const totalNamesToDraw = 22;
const drawnNames = [];
let currentAngle = 0;

function drawWheel(names) {
  const num = names.length;
  const angle = (2 * Math.PI) / num;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < num; i++) {
    const start = angle * i + currentAngle;
    const end = start + angle;
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 190, start, end);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? "#87CEFA" : "#ADD8E6";
    ctx.fill();
    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(start + angle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Arial";
    ctx.fillText(names[i], 180, 5);
    ctx.restore();
  }
}

async function startDraw() {
  for (let i = 0; i < totalNamesToDraw && names.length > 0; i++) {
    await spinWheel();
  }
}

function spinWheel() {
  return new Promise((resolve) => {
    const randomIndex = Math.floor(Math.random() * names.length);
    const selectedName = names[randomIndex];
    const segmentAngle = (2 * Math.PI) / names.length;
    const targetAngle = 2 * Math.PI * 5 + (Math.PI * 1.5) - (randomIndex * segmentAngle) - (segmentAngle / 2);
    let start = currentAngle;
    let progress = 0;

    function animate() {
      progress += 0.05;
      if (progress >= 1) {
        currentAngle = targetAngle % (2 * Math.PI);
        names.splice(randomIndex, 1);
        drawnNames.push(selectedName);
        drawWheel(names);
        updateWinners();
        resolve();
        return;
      }
      const eased = easeOutCubic(progress);
      currentAngle = start + (targetAngle - start) * eased;
      drawWheel(names);
      requestAnimationFrame(animate);
    }

    animate();
  });
}

function easeOutCubic(t) {
  return (--t) * t * t + 1;
}

function updateWinners() {
  const container = document.getElementById("winnerList");
  container.innerHTML = "";
  const columns = Math.ceil(drawnNames.length / 10);
  for (let i = 0; i < columns; i++) {
    const column = document.createElement("div");
    column.className = "winner-column";
    const title = document.createElement("h3");
    title.textContent = `Grupo ${i + 1}`;
    column.appendChild(title);
    const list = document.createElement("ol");
    for (let j = 0; j < 10; j++) {
      const nameIndex = i * 10 + j;
      if (drawnNames[nameIndex]) {
        const li = document.createElement("li");
        li.textContent = drawnNames[nameIndex];
        list.appendChild(li);
      }
    }
    column.appendChild(list);
    container.appendChild(column);
  }
}

function loadCSV(event) {
  const file = event.target.files[0];
  if (file && file.type === "text/csv") {
    const reader = new FileReader();
    reader.onload = function(e) {
      const contents = e.target.result;
      names = parseCSV(contents);
      drawnNames.length = 0;
      currentAngle = 0;
      drawWheel(names);
    };
    reader.readAsText(file);
  } else {
    alert("Por favor, carregue um arquivo CSV.");
  }
}

function parseCSV(data) {
  const lines = data.split("\n");
  return lines.map(line => line.trim()).filter(line => line.length > 0);
}

drawWheel(names);
