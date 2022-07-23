// Node modules
import React, { Component } from "react";

// Components
import Navbar from "../Navbar/Navigation";
import NotInit from "../NotInit";

// CSS
import "./Registration.css";

// Contract
import getWeb3 from "../../getWeb3";
import newsDetection from "../../contracts/newsDetection.json";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newsDetectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      isElStarted: false,
      isElEnded: false,
      evaluatorCount: undefined,
      evaluatorName: "",
      evaluatorPhone: "",
      evaluators: [],
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

  // refreshing once
  componentDidMount = async () => {
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

      // Admin account and verification
      const admin = await this.state.newsDetectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Get start and end values
      const start = await this.state.newsDetectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.newsDetectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Total number of evaluators
      const evaluatorCount = await this.state.newsDetectionInstance.methods
        .getTotalEvaluator()
        .call();
      this.setState({ evaluatorCount: evaluatorCount });

      // Loading all the evaluators
      for (let i = 0; i < this.state.evaluatorCount; i++) {
        const evaluatorAddress = await this.state.newsDetectionInstance.methods
          .evaluators(i)
          .call();
        const evaluator = await this.state.newsDetectionInstance.methods
          .evaluatorDetails(evaluatorAddress)
          .call();
        this.state.evaluators.push({
          address: evaluator.evaluatorAddress,
          name: evaluator.name,
          phone: evaluator.phone,
          hasVoted: evaluator.hasVoted,
          isVerified: evaluator.isVerified,
          isRegistered: evaluator.isRegistered,
        });
      }
      this.setState({ evaluators: this.state.evaluators });

      // Loading current evaluators
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
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details (f12).`
      );
    }
  };
  updateEvaluatorName = (event) => {
    this.setState({ evaluatorName: event.target.value });
  };
  updateEvaluatorPhone = (event) => {
    this.setState({ evaluatorPhone: event.target.value });
  };
  registerAsEvaluator = async () => {
    await this.state.newsDetectionInstance.methods
      .registerAsEvaluator(this.state.evaluatorName, this.state.evaluatorPhone)
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
    return (
      <>
        <Navbar isAdmin={this.state.isAdmin} />
        {!this.state.isElStarted && !this.state.isElEnded ? (
          <NotInit />
        ) : (
          <>
            <div className="container-item info">
              <p>Total registered evaluators: {this.state.evaluators.length}</p>
            </div>
            <div className="container-main">
              <h3>Registration</h3>
              <small>Register to evaluate.</small>
              <div className="container-item">
                <form>
                  <div className="div-li">
                    <label className={'label-r'}>
                      Account Address
                      <input
                        className={'input-r'}
                        type="text"
                        value={this.state.account}
                        style={{ width: '400px' }}
                      />{' '}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={'label-r'}>
                      Name
                      <input
                        className={'input-r'}
                        type="text"
                        placeholder="eg. Anis"
                        value={this.state.evaluatorName}
                        onChange={this.updateEvaluatorName}
                      />{' '}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={'label-r'}>
                      Phone number <span style={{ color: 'tomato' }}>*</span>
                      <input
                        className={'input-r'}
                        type="number"
                        placeholder="eg. 0179400000"
                        value={this.state.evaluatorPhone}
                        onChange={this.updateEvaluatorPhone}
                      />
                    </label>
                  </div>
                  <p className="note">
                    <span style={{ color: 'tomato' }}> Note: </span>
                    <br /> Correctly fill up your Account address, name and
                    phone number Make sure your account address and Phone number
                    are correct.
                  </p>
                  <button
                    className="btn-add"
                    disabled={
                      this.state.evaluatorPhone.length !== 10 ||
                      this.state.currentEvaluator.isVerified
                    }
                    onClick={this.registerAsEvaluator}
                  >
                    {this.state.currentEvaluator.isRegistered
                      ? 'Update'
                      : 'Register'}
                  </button>
                </form>
              </div>
            </div>
            <div
              className="container-main"
              style={{
                borderTop: this.state.currentEvaluator.isRegistered
                  ? null
                  : '1px solid',
              }}
            >
              {loadCurrentEvaluator(
                this.state.currentEvaluator,
                this.state.currentEvaluator.isRegistered
              )}
            </div>
            {this.state.isAdmin ? (
              <div
                className="container-main"
                style={{ borderTop: '1px solid' }}
              >
                <small>TotalEvaluators: {this.state.evaluators.length}</small>
                {loadAllEvaluators(this.state.evaluators)}
              </div>
            ) : null}
          </>
        )}
      </>
    );
  }
}
export function loadCurrentEvaluator(evaluator, isRegistered) {
  return (
    <>
      <div
        className={"container-item " + (isRegistered ? "success" : "attention")}
      >
        <center>Your Registered Info</center>
      </div>
      <div
        className={"container-list " + (isRegistered ? "success" : "attention")}
      >
        <table>
          <tr>
            <th>Your Account Address :</th>
            <td>{evaluator.address}</td>
          </tr>
          <tr>
            <th>Your Name :</th>
            <td>{evaluator.name}</td>
          </tr>
          <tr>
            <th>Your Phone :</th>
            <td>{evaluator.phone}</td>
          </tr>
          <tr>
            <th>Voted</th>
            <td>{evaluator.hasVoted ? "True" : "False"}</td>
          </tr>
          <tr>
            <th>Verification</th>
            <td>{evaluator.isVerified ? "True" : "False"}</td>
          </tr>
          <tr>
            <th>Registered</th>
            <td>{evaluator.isRegistered ? "True" : "False"}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
export function loadAllEvaluators(evaluators) {
  const renderAllEvaluators = (evaluator) => {
    return (
      <>
        <div className="container-list success">
          <table>
            <tr>
              <th>Account address</th>
              <td>{evaluator.address}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{evaluator.name}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{evaluator.phone}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{evaluator.hasVoted ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{evaluator.isVerified ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{evaluator.isRegistered ? "True" : "False"}</td>
            </tr>
          </table>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container-item success">
        <center>List of evaluators</center>
      </div>
      {evaluators.map(renderAllEvaluators)}
    </>
  );
}
