<p align="center">
    <img src="https://github.com/Ningsang-Jabegu/TRA-1-OCS-online-birth-registration-system/blob/main/src/assets/photoUsed/Coat_Of_Arms_Logo.png?raw=true" alt="Coat of Arms Logo" width="100" style="height:auto;">
</p>

<h1 align="center">Online Birth Registration System (Frontend)</h1>

<p align="center"><b>Modern, user-friendly interface for digital birth registration and certificate management.</b></p>

<br>

<table width="100%">
  <tr>
    <td align="left"><b>Documentation First Created On:</b> 2025/06/10</td>
    <td align="right"><b>Last updated on:</b> 2024/06/14</td>
  </tr>
</table>

<br>

**Main Features:**

- **User Registration:** Users can create accounts as `Citizen`, `Guest`, or `Administrator`, with each role providing access to specific system features. Additionally, the `Administrator` role includes multiple sub-roles, as defined by the organization head, allowing for more granular administrative privileges.

- **Dynamic Dashboard Rendering:** The dashboard displays components based on the user's access privileges received from the backend. Users see only the features and navigation options relevant to their role (`Citizen`, `Guest`, or `Administrator`).

- **Role-Based Access:** After login, the frontend uses the access privileges provided by the server to generate the exact set of components and actions each user is allowed. For example, only `Administrator` users need to enter a Secret Code (provided by the organization) during registration to create an account.

- **Secret Code for Administrators:** Only users registering as Administrators are required to enter a secret code provided by the organization. This code verifies their role and determines their level of system access.

- **Birth Registration:** Easily register births online without visiting government offices. Submit all required information digitally through intuitive forms.

- **Certificate Verification:** Quickly verify the authenticity of birth certificates using our secure verification system. Users can enter a certificate number or scan a QR code to check validity.

- **Digital Certificates:** Download and print official birth certificates with secure QR codes for verification from anywhere areound the world.

- **Responsive Design:** The UI is optimized for desktops, tablets, and mobile devices, ensuring a seamless experience everywhere.

<br>

*This repository contains the frontend code powering the above features. For backend code, please visit [TRA-1-OCS-online-birth-registration-system-BackEnd](https://github.com/Ningsang-Jabegu/TRA-1-OCS-online-birth-registration-system-BackEnd.git).*

<br>

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm (Node Package Manager)
- git

> [!IMPORTANT]
> Please create pull requests from your feature branch to the main branch.

> [!NOTE]
> For any issues or questions, refer to the documentation or contact the maintainers.

### Setup Steps

1. **Clone the Repository**

    ```bash
    git clone https://github.com/Ningsang-Jabegu/TRA-1-OCS-online-birth-registration-system.git

    cd TRA-1-OCS-online-birth-registration-system
    ```

2. **Install Dependencies**

    ```bash
    npm i
    ```

3. **Configure Environment Variables**

    - Copy `.env.example` to `.env` and update values as needed.

4. **Run the Application**

    ```bash
    npm run dev
    ```

    The frontend app will start, typically at `http://localhost:8080`.

---

## 🛠️ Contributing

- Fork the repository and create your feature branch.
- Commit using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- Push your branch and open a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center"><b>Empowering digital birth registration for everyone.</b></p>
