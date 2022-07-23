// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// Contract
import getWeb3 from "../../getWeb3";
import newsDetection from "../../contracts/newsDetection.json";

// CSS
import "./Outcomes.css";

export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newsDetectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      newsCount: undefined,
      newss: [],
      isElStarted: false,
      isElEnded: false,
    };
  }
  componentDidMount = async () => {
    // refreshing once
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
      this.setState({ web3, newsDetectionInstance: instance, account: accounts[0] });

      // Get total number of newss
      const newsCount = await this.state.newsDetectionInstance.methods
        .getTotalNews()
        .call();
      this.setState({ newsCount: newsCount });

      // Get start and end values
      const start = await this.state.newsDetectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.newsDetectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Loadin newss detials
      for (let i = 1; i <= this.state.newsCount; i++) {
        const news = await this.state.newsDetectionInstance.methods
          .newsDetails(i - 1)
          .call();
        this.state.newss.push({
          id: news.newsId,
          newsPost: news.newsPost,
          voteCount: news.voteCount,
        });
      }

      this.setState({ newss: this.state.newss });

      // Admin account and verification
      const admin = await this.state.newsDetectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }

    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        <br />
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <div className="container-item attention">
              <center>
                <h3>The news Detection is being conducted at the movement.</h3>
                <p>Outcome will be displayed once the newsDetection has ended.</p>
                <p>Go ahead and cast your vote for authentic one.</p>
                <br />
                <Link
                  to="/Voting"
                  style={{ color: "black", textDecoration: "underline" }}
                >
                  Voting Page
                </Link>
              </center>
            </div>
          ) : !this.state.isElStarted && this.state.isElEnded ? (
            displayOutcomes(this.state.newss)
          ) : null}
        </div>
      </>
    );
  }
}

function displayWinner(newss) {
  const getWinner = (newss) => {
    // Returns an object having maxium vote count
    let maxVoteRecived = 0;
    let winnernews = [];
    for (let i = 0; i < newss.length; i++) {
      if (newss[i].voteCount > maxVoteRecived) {
        maxVoteRecived = newss[i].voteCount;
        winnernews = [newss[i]];
      } else if (newss[i].voteCount === maxVoteRecived) {
        winnernews.push(newss[i]);
      }
    }
    return winnernews;
  };
  const renderWinner = (winner) => {
    return (
      <div className="container-winner">
        <div className="winner-info">
          <p className="winner-tag">Authentic News!</p>
          <h2> {winner.newsPost}</h2>
        </div>
        <div className="winner-votes">
          <div className="votes-tag">Total Votes for Authenticity: </div>
          <div className="vote-count">{winner.voteCount}</div>
        </div>
      </div>
    );
  };
  const winnernews = getWinner(newss);
  return <>{winnernews.map(renderWinner)}</>;
}

export function displayOutcomes(newss) {
  const renderOutcomes = (news) => {
    return (
      <tr>
        <td>{news.id}</td>
        <td>{news.newsPost}</td>
        <td>{news.voteCount}</td>
      </tr>
    );
  };
  return (
    <>
      {newss.length > 0 ? (
        <div className="container-main">{displayWinner(newss)}</div>
      ) : null}
      <div className="container-main" style={{ borderTop: "1px solid" }}>
        <h2>Outcomes</h2>
        <small>Total news: {newss.length}</small>
        {newss.length < 1 ? (
          <div className="container-item attention">
            <center>No news.</center>
          </div>
        ) : (
          <>
            <div className="container-item">
              <table>
                <tr>
                  <th>Id</th>
                  <th>News</th>
                  <th>Votes</th>
                </tr>
                {newss.map(renderOutcomes)}
              </table>
            </div>
            <div
              className="container-item"
              style={{ border: "1px solid black" }}
            >
              <center>That is all.</center>
            </div>
          </>
        )}
      </div>
    </>
  );
}
