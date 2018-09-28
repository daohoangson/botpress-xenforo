import React from "react";

import {
  Panel,
  Grid,
  Row,
  Col,
  ControlLabel,
  FormGroup,
  FormControl,
  Alert,
  Button
} from "react-bootstrap";

import style from "./style.scss";

export default class TemplateModule extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      config: {},
      token: {}
    };
  }

  componentDidMount() {
    const { bp } = this.props;
    const { axios } = bp;

    axios.get("/api/botpress-xenforo/config").then(res =>
      this.setState({
        loading: false,
        config: res.data
      })
    );

    axios
      .get("/api/botpress-xenforo/token")
      .then(res => this.setState({ token: res.data }));
  }

  render() {
    const { config, token } = this.state;

    return (
      <Grid>
        <Row>
          <Col md={8} mdOffset={2}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3">Configuration</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <div className="form-horizontal">
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}>
                      API Root
                    </Col>
                    <Col sm={8}>
                      <FormControl
                        type="url"
                        value={config.apiRoot}
                        disabled={true}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}>
                      Client ID
                    </Col>
                    <Col sm={8}>
                      <FormControl value={config.clientId} disabled={true} />
                    </Col>
                  </FormGroup>

                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}>
                      Client Secret
                    </Col>
                    <Col sm={8}>
                      <FormControl
                        type="password"
                        value={config.clientSecret}
                        disabled={true}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}>
                      Username
                    </Col>
                    <Col sm={8}>
                      <FormControl value={config.username} disabled={true} />
                    </Col>
                  </FormGroup>

                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}>
                      Password
                    </Col>
                    <Col sm={8}>
                      <FormControl
                        type="password"
                        value={config.password}
                        disabled={true}
                      />
                    </Col>
                  </FormGroup>
                </div>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>

        <Row>
          <Col md={8} mdOffset={2}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3">Token</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <div className="form-horizontal">
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}>
                      Access Token
                    </Col>
                    <Col sm={8}>
                      <FormControl value={token.access_token} disabled={true} />
                    </Col>
                  </FormGroup>

                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}>
                      Refresh Token
                    </Col>
                    <Col sm={8}>
                      <FormControl
                        value={token.refresh_token}
                        disabled={true}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}>
                      Scope
                    </Col>
                    <Col sm={8}>
                      <FormControl value={token.scope} disabled={true} />
                    </Col>
                  </FormGroup>

                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}>
                      User ID
                    </Col>
                    <Col sm={8}>
                      <FormControl value={token.user_id} disabled={true} />
                    </Col>
                  </FormGroup>
                </div>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}
