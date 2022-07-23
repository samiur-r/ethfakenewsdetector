import React, { Component } from "react";

import Navbar from '../../Navbar/Navigation';

import getWeb3 from "../../../getWeb3";
import newsDetection from "../../../contracts/newsDetection.json";

import AdminOnly from "../../AdminOnly";

import "./AddNews.css";

export default class AddNews extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newsDetectionInstance: undefined,
      web3: null,
      accounts: null,
      isAdmin: false,
      newsPost: "",
      newss: [],
      newsCount: undefined,
    };
  }

  componentDidMount = async () => {
    // refreshing page only once
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = newsDetection.networks[networkId];
      const instance = new web3.eth.Contract(
        newsDetection.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3: web3,
        newsDetectionInstance: instance,
        account: accounts[0],
      });

      // Total number of newss
      const newsCount = await this.state.newsDetectionInstance.methods
        .getTotalNews()
        .call();
      this.setState({ newsCount: newsCount });

      const admin = await this.state.newsDetectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Loading newss details
      for (let i = 0; i < this.state.newsCount; i++) {
        const news = await this.state.newsDetectionInstance.methods
          .newsDetails(i)
          .call();
        this.state.newss.push({
          id: news.newsId,
          newsPost: news.newsPost,
        });
      }

      this.setState({ newss: this.state.newss });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
    }
  };
  updateNewsPost = (event) => {
    this.setState({ newsPost: event.target.value });
  };


  addNews = async () => {
    await this.state.newsDetectionInstance.methods
      .addNews(this.state.newsPost)
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          <Navbar isAdmin={this.state.isAdmin} />
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }
    if (!this.state.isAdmin) {
      return (
        <>
          <Navbar isAdmin={this.state.isAdmin} />
          <AdminOnly page="Add news Page." />
        </>
      );
    }
    return (
      <>
        <Navbar isAdmin={this.state.isAdmin} />
        <div className="container-main">
          <h2>Add a new news</h2>
          <small>Total newss: {this.state.newsCount}</small>
          <div className="container-item">
            <form className="form">
              <label className={'label-ac'}>
                NewsPost
                <input
                  className={'input-ac'}
                  type="text"
                  placeholder="eg. বৃষ্টির আগেই শেষ সাকিব–ঝড়"
                  value={this.state.newsPost}
                  onChange={this.updateNewsPost}
                />
              </label>

              <button
                className="btn-add"
                disabled={
                  this.state.newsPost.length < 3 ||
                  this.state.newsPost.length > 100
                }
                onClick={this.addNews}
              >
                Add
              </button>
            </form>
          </div>
        </div>
        {loadAdded(this.state.newss)}
      </>
    );
  }
}
export function loadAdded(newss) {
  const renderAdded = (news) => {
    return (
      <>
        <div className="container-list success">
          <div
            style={{
              maxHeight: "21px",
              overflow: "auto",
            }}
          >
            {news.id}. <strong>{news.newsPost}</strong>:{" "}
          </div>
        </div>
      </>
    );
  };
  return (
    <div className="container-main" style={{ borderTop: "1px solid" }}>
      <div className="container-item info">
        <center>Newss List</center>
      </div>
      {newss.length < 1 ? (
        <div className="container-item alert">
          <center>No news added.</center>
        </div>
      ) : (
        <div
          className="container-item"
          style={{
            display: "block",
            backgroundColor: "#DDFFFF",
          }}
        >
          {newss.map(renderAdded)}
        </div>
      )}
    </div>
  );
}
