import React, { useRef, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import Modal from "./Modal"; // Import the Modal component

const Manager = () => {
  const ref = useRef();
  const passwordRef = useRef();
  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setPasswordArray] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordToDelete, setPasswordToDelete] = useState(null);

  const getPasswords = async () => {
    let req = await fetch("http://localhost:3000/");
    let passwords = await req.json();
    setPasswordArray(passwords);
  };

  useEffect(() => {
    getPasswords();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const copyText = (text) => {
    toast("Copied to Clipboard!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    navigator.clipboard.writeText(text);
  };

  const showPassword = () => {
    const isPassword = passwordRef.current.type === "password";
    passwordRef.current.type = isPassword ? "text" : "password";
    ref.current.src = isPassword ? "icons/eyecross.png" : "icons/eye.png";
  };

  const savePassword = async () => {
    if (
      form.site.length > 3 &&
      form.username.length > 3 &&
      form.password.length > 3
    ) {
      const newEntry = { ...form, id: form.id || uuidv4() };
      const updatedPasswordArray = form.id
        ? passwordArray.map((item) => (item.id === form.id ? newEntry : item))
        : [...passwordArray, newEntry];

      setPasswordArray(updatedPasswordArray);

      const method = form.id ? "PUT" : "POST";
      await fetch(`http://localhost:3000/`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      setForm({ site: "", username: "", password: "" });
      toast("Password saved!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      toast.error("Password not saved!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const editPassword = (id) => {
    const selectedPassword = passwordArray.find((item) => item.id === id);
    setForm(selectedPassword);
  };

  const confirmDeletePassword = (id) => {
    setPasswordToDelete(id);
    setModalVisible(true);
  };

  const deletePassword = async () => {
    setPasswordArray(passwordArray.filter((item) => item.id !== passwordToDelete));
    await fetch("http://localhost:3000/", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: passwordToDelete }),
    });

    toast("Password Deleted!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

    setModalVisible(false);
    setPasswordToDelete(null);
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Modal
        show={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={deletePassword}
      />
      <div className="absolute inset-0 -z-10 h-full w-full"></div>

      <div className="p-2 md:mycontainer min-h-[88.2vh]">
        <h1 className="text-4xl text font-bold text-center">
          <span className="text-green-500"> &lt;</span>
          <span>Pass</span>
          <span className="text-green-500">OP/&gt;</span>
        </h1>
        <p className="text-green-900 text-lg text-center">
          Your own Password Manager
        </p>
        <div className="text-black flex flex-col p-4 gap-5 items-center">
          <input
            onChange={handleChange}
            value={form.site}
            type="text"
            placeholder="Enter Website URL"
            className="rounded-full border border-green-500 w-full py-1 px-4"
            name="site"
            id="site"
          />
          <div className="flex flex-col md:flex-row w-full gap-5 justify-between">
            <input
              onChange={handleChange}
              value={form.username}
              type="text"
              placeholder="Enter Username"
              className="rounded-full border border-green-500 w-full py-1 px-4"
              name="username"
              id="username"
            />
            <div className="relative w-full">
              <input
                ref={passwordRef}
                onChange={handleChange}
                value={form.password}
                type="password"
                placeholder="Enter Password"
                className="rounded-full border border-green-500 w-full py-1 px-4"
                name="password"
                id="password"
              />
              <span
                className="absolute right-[3px] top-[4px] cursor-pointer"
                onClick={showPassword}
              >
                <img
                  className="p-1"
                  width={26}
                  src="icons/eye.png"
                  alt="eye"
                  ref={ref}
                />
              </span>
            </div>
          </div>
          <button
            onClick={savePassword}
            className="flex justify-center items-center bg-green-500 hover:bg-green-600 rounded-full px-8 gap-2 py-2 w-fit"
          >
            <lord-icon
              src="https://cdn.lordicon.com/jgnvfzqg.json"
              trigger="hover"
            ></lord-icon>
            Save Password
          </button>
        </div>
        <div className="passwords">
          <h2 className="text-2xl font-bold py-4">Your Passwords</h2>
          {passwordArray.length === 0 && <div>No Password to Show</div>}
          {passwordArray.length !== 0 && (
            <table className="table-auto w-full rounded-md overflow-hidden mb-5">
              <thead className="bg-green-800 text-white">
                <tr>
                  <th className="py-2">Site</th>
                  <th className="py-2">Username</th>
                  <th className="py-2">Password</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-green-100">
                {passwordArray.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 border border-white text-center">
                      <div className="flex justify-center items-center">
                        <a href={item.site} target="_blank" rel="noopener noreferrer">
                          {item.site}
                        </a>
                        <div
                          className="lordiconcopy size-7 cursor-pointer"
                          onClick={() => copyText(item.site)}
                        >
                          <lord-icon
                            style={{
                              width: "25px",
                              height: "25px",
                              paddingTop: "3px",
                              paddingLeft: "5px",
                            }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover"
                          ></lord-icon>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 border border-white text-center">
                      <div className="flex justify-center items-center">
                        {item.username}
                        <div
                          className="lordiconcopy size-7 cursor-pointer"
                          onClick={() => copyText(item.username)}
                        >
                          <lord-icon
                            style={{
                              width: "25px",
                              height: "25px",
                              paddingTop: "3px",
                              paddingLeft: "5px",
                            }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover"
                          ></lord-icon>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 border border-white text-center">
                      <div className="flex justify-center items-center">
                        {"*".repeat(item.password.length)}
                        <div
                          className="lordiconcopy size-7 cursor-pointer"
                          onClick={() => copyText(item.password)}
                        >
                          <lord-icon
                            style={{
                              width: "25px",
                              height: "25px",
                              paddingTop: "3px",
                              paddingLeft: "5px",
                            }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover"
                          ></lord-icon>
                        </div>
                      </div>
                    </td>
                    <td className="justify-center py-2 border border-white text-center">
                      <span
                        className="cursor-pointer mx-1"
                        onClick={() => editPassword(item.id)}
                      >
                        <lord-icon
                          src="https://cdn.lordicon.com/gwlusjdu.json"
                          trigger="hover"
                          style={{ width: "25px", height: "25px" }}
                        ></lord-icon>
                      </span>
                      <span
                        className="cursor-pointer mx-1"
                        onClick={() => confirmDeletePassword(item.id)}
                      >
                        <lord-icon
                          src="https://cdn.lordicon.com/skkahier.json"
                          trigger="hover"
                          style={{ width: "25px", height: "25px" }}
                        ></lord-icon>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default Manager;
