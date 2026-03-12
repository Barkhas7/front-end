const SOAP_URL = "http://localhost:8081/auth";
const JSON_URL = "http://localhost:8082/users";

function extractSoapReturnValue(xmlText) {
    const match = xmlText.match(/<return>([\s\S]*?)<\/return>/);
    return match && match[1] ? match[1].trim() : null;
}

async function getUserIdFromToken(token) {
    const soapBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.soap.barkhas.com/">
            <soapenv:Header/>
            <soapenv:Body>
                <ser:getUserIdByToken>
                    <token>${token}</token>
                </ser:getUserIdByToken>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    const response = await fetch(SOAP_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml;charset=UTF-8"
        },
        body: soapBody
    });

    const text = await response.text();
    const value = extractSoapReturnValue(text);
    return value ? parseInt(value) : -1;
}

function setCreateButtonState(disabled) {
    const btn = document.getElementById("createBtn");
    if (btn) btn.disabled = disabled;
}

function fillProfileForm(profile) {
    document.getElementById("profileId").value = profile.id || "";
    document.getElementById("name").value = profile.name || "";
    document.getElementById("email").value = profile.email || "";
    document.getElementById("bio").value = profile.bio || "";
    document.getElementById("phone").value = profile.phone || "";
}

async function loadMyProfileIfExists() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const message = document.getElementById("profileMessage");
    const result = document.getElementById("profileResult");

    if (!token || !userId) return;

    try {
        const response = await fetch(`${JSON_URL}/by-user?userId=${userId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const text = await response.text();

        if (response.ok) {
            const json = JSON.parse(text);
            fillProfileForm(json);
            result.innerText = JSON.stringify(json, null, 2);
            message.innerText = "Өмнөх хэрэглэгчийн хуудас ачааллаа.";
            setCreateButtonState(true);
        } else {
            message.innerText = "Хэрэглэгчийн хуудас байхгүй байна. Шинээр үүсгэнэ үү.";
            setCreateButtonState(false);
        }
    } catch (error) {
        message.innerText = "Хэрэглэгчийн хуудас ачаалах үед алдаа гарлаа: " + error.message;
    }
}

async function registerUser() {
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const message = document.getElementById("registerMessage");

    if (!username || !password) {
        message.innerText = "Бүртгүүлэх нэр, нууц үгээ оруулна уу.";
        return;
    }

    const soapBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.soap.barkhas.com/">
            <soapenv:Header/>
            <soapenv:Body>
                <ser:registerUser>
                    <username>${username}</username>
                    <password>${password}</password>
                </ser:registerUser>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    try {
        const response = await fetch(SOAP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/xml;charset=UTF-8"
            },
            body: soapBody
        });

        const text = await response.text();
        const value = extractSoapReturnValue(text);

        if (!value) {
            message.innerText = "Бүртгэлийн хариу уншигдсангүй.";
            return;
        }

        if (value.includes("successfully")) {
            message.innerText = "Амжилттай бүртгэгдлээ.";
        } else if (value.includes("UNIQUE") || value.includes("failed")) {
            message.innerText = "Энэ нэр өмнө нь бүртгэгдсэн байна.";
        } else {
            message.innerText = value;
        }
    } catch (error) {
        message.innerText = "Бүртгэх үед алдаа гарлаа: " + error.message;
    }
}

async function loginUser() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const message = document.getElementById("loginMessage");

    const soapBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.soap.barkhas.com/">
            <soapenv:Header/>
            <soapenv:Body>
                <ser:loginUser>
                    <username>${username}</username>
                    <password>${password}</password>
                </ser:loginUser>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    try {
        const response = await fetch(SOAP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/xml;charset=UTF-8"
            },
            body: soapBody
        });

        const text = await response.text();
        const value = extractSoapReturnValue(text);

        if (!value) {
            message.innerText = "Нэвтрэлт амжилтгүй.";
            return;
        }

        if (value.includes("failed") || value.includes("Invalid") || value.includes("null")) {
            message.innerText = value;
            return;
        }

        localStorage.setItem("token", value);

        const userId = await getUserIdFromToken(value);
        localStorage.setItem("userId", userId);

        message.innerText = "Амжилттай нэвтэрлээ.";
        window.location.href = "profile.html";
    } catch (error) {
        message.innerText = "Нэвтрэх үед алдаа гарлаа: " + error.message;
    }
}

async function createProfile() {
    const token = localStorage.getItem("token");
    const userId = parseInt(localStorage.getItem("userId"));
    const message = document.getElementById("profileMessage");

    const data = {
        userId: userId,
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        bio: document.getElementById("bio").value,
        phone: document.getElementById("phone").value
    };

    try {
        const response = await fetch(JSON_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(data)
        });

        const text = await response.text();
        message.innerText = text;

        const match = text.match(/Profile ID:\s*(\d+)/i);
        if (match && match[1]) {
            document.getElementById("profileId").value = match[1];
            setCreateButtonState(true);
        }
    } catch (error) {
        message.innerText = "Create error: " + error.message;
    }
}

async function getProfile() {
    const token = localStorage.getItem("token");
    const profileId = document.getElementById("profileId").value;
    const result = document.getElementById("profileResult");
    const message = document.getElementById("profileMessage");

    if (!profileId) {
        message.innerText = "Хэрэглэгчийн дугаар олдсонгүй.";
        return;
    }

    try {
        const response = await fetch(`${JSON_URL}/${profileId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const text = await response.text();

        if (response.ok) {
            const json = JSON.parse(text);
            fillProfileForm(json);
            result.innerText = JSON.stringify(json, null, 2);
            message.innerText = "Хэрэглэгчийн хуудас ачааллаа.";
        } else {
            result.innerText = text;
            message.innerText = "Хэрэглэгчийн хуудас олдсонгүй.";
        }
    } catch (error) {
        message.innerText = "Get error: " + error.message;
    }
}

async function updateProfile() {
    const token = localStorage.getItem("token");
    const userId = parseInt(localStorage.getItem("userId"));
    const profileId = document.getElementById("profileId").value;
    const message = document.getElementById("profileMessage");

    if (!profileId) {
        message.innerText = "Эхлээд хэрэглэгчийн хуудас үүсгэнэ үү.";
        return;
    }

    const data = {
        userId: userId,
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        bio: document.getElementById("bio").value,
        phone: document.getElementById("phone").value
    };

    try {
        const response = await fetch(`${JSON_URL}/${profileId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(data)
        });

        const text = await response.text();
        message.innerText = text;
    } catch (error) {
        message.innerText = "Update error: " + error.message;
    }
}

async function deleteProfile() {
    const token = localStorage.getItem("token");
    const profileId = document.getElementById("profileId").value;
    const message = document.getElementById("profileMessage");

    if (!profileId) {
        message.innerText = "Устгах хэрэглэгчийн хуудас байхгүй.";
        return;
    }

    try {
        const response = await fetch(`${JSON_URL}/${profileId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const text = await response.text();
        message.innerText = text;

        document.getElementById("profileId").value = "";
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("bio").value = "";
        document.getElementById("phone").value = "";
        document.getElementById("profileResult").innerText = "";

        setCreateButtonState(false);
    } catch (error) {
        message.innerText = "Алдаа: " + error.message;
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("profileMessage")) {
        loadMyProfileIfExists();
    }
});