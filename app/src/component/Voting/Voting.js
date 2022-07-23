// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";

// Components
import Navbar from "../Navbar/Navigation";
import NotInit from "../NotInit";

// Contract
import getWeb3 from "../../getWeb3";
import newsDetection from "../../contracts/newsDetection.json";

// CSS
import "./Voting.css";

export default class Voting extends Component {
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
      currentEvaluator: {
        address: undefined,
        name: null,
        phone: null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
      },
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
      this.setState({
        web3: web3,
        newsDetectionInstance: instance,
        account: accounts[0],
      });

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

      // Loading newss details
      for (let i = 1; i <= this.state.newsCount; i++) {
        const news = await this.state.newsDetectionInstance.methods
          .newsDetails(i - 1)
          .call();
        this.state.newss.push({
          id: news.newsId,
          newsPost: news.newsPost,
        });
      }
      this.setState({ newss: this.state.newss });

      // Loading current Evaluator
      const evaluator = await this.state.newsDetectionInstance.methods
        .evaluatorDetails(this.state.account)
        .call();
      this.setState({
        currentEvaluator: {
          address: evaluator.evaluatorAddress,
          name: evaluator.name,
          phone: evaluator.phone,
          hasVoted: evaluator.hasVoted,
          isVerified: evaluator.isVerified,
          isRegistered: evaluator.isRegistered,
        },
      });

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

  renderNewss = (news) => {
    const castVote = async (id) => {
      await this.state.newsDetectionInstance.methods
        .vote(id)
        .send({ from: this.state.account, gas: 1000000 });
      window.location.reload();
    };
    const confirmVote = (id, newsPost) => {
      var r = window.confirm(
        "Vote for " + newsPost + " with Id " + id + ".\nAre you sure is this True news?"
      );
      if (r === true) {
        castVote(id);
      }
    };
    return (
      <div className="container-item">
        <div className="news-info">
          <h2>
            {news.newsPost} <small>#{news.id}</small>
          </h2>
        </div>
        <div className="vote-btn-container">
          <button
            onClick={() => confirmVote(news.id, news.newsPost)}
            className="vote-bth"
            disabled={
              !this.state.currentEvaluator.isRegistered ||
              !this.state.currentEvaluator.isVerified ||
              this.state.currentEvaluator.hasVoted
            }
          >
            Vote as Authentic
          </button>
        </div>
      </div>
    );
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

    return (
      <>
        <Navbar isAdmin={this.state.isAdmin} />
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <>
              {this.state.currentEvaluator.isRegistered ? (
                this.state.currentEvaluator.isVerified ? (
                  this.state.currentEvaluator.hasVoted ? (
                    <div className="container-item success">
                      <div>
                        <strong>
                          You've casted your vote for authentic news.
                        </strong>
                        <p />
                        <center>
                          <Link
                            to="/Outcomes"
                            style={{
                              color: 'black',
                              textDecoration: 'underline',
                            }}
                          >
                            See Outcomes
                          </Link>
                        </center>
                      </div>
                    </div>
                  ) : (
                    <div className="container-item info">
                      <center>vote for true news.</center>
                    </div>
                  )
                ) : (
                  <div className="container-item attention">
                    <center>For admin verification please wait!!</center>
                  </div>
                )
              ) : (
                <>
                  <div className="container-item attention">
                    <center>
                      <p>
                        You're not registered as an evaluator. You have to
                        register first.
                      </p>
                      <br />
                      <Link
                        to="/Registration"
                        style={{ color: 'black', textDecoration: 'underline' }}
                      >
                        Registration Page
                      </Link>
                    </center>
                  </div>
                </>
              )}
              <div className="container-main">
                <h2>News</h2>
                <small>Total news: {this.state.newss.length}</small>
                {this.state.newss.length < 1 ? (
                  <div className="container-item attention">
                    <center>Not one to vote for.</center>
                  </div>
                ) : (
                  <>
                    {this.state.newss.map(this.renderNewss)}
                    <div
                      className="container-item"
                      style={{ border: '1px solid black' }}
                    >
                      <center>That is all news.</center>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : !this.state.isElStarted && this.state.isElEnded ? (
            <>
              <div className="container-item attention">
                <center>
                  <h3>The news Detection ended.</h3>
                  <br />
                  <Link
                    to="/Outcomes"
                    style={{ color: 'black', textDecoration: 'underline' }}
                  >
                    See Outcomes
                  </Link>
                </center>
              </div>
            </>
          ) : null}
        </div>
      </>
    );
  }
}
