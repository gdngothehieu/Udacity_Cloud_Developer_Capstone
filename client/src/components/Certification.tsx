import dateFormat from "dateformat";
import { History } from "history";
import update from "immutability-helper";
import * as React from "react";
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
} from "semantic-ui-react";

import {
  createCertification,
  deleteCertification,
  getCertification,
  patchCertification,
  searchCertification,
} from "../api/certification-api";
import Auth from "../auth/Auth";
import { Certifications } from "../types/Certification";

interface CertificationProps {
  auth: Auth;
  history: History;
}

interface CertificationState {
  certification: Certifications[];
  newCertificationName: string;
  loadingCertification: boolean;
  searchContent: string;
}

export class Certification extends React.PureComponent<
  CertificationProps,
  CertificationState
> {
  state: CertificationState = {
    certification: [],
    newCertificationName: "",
    loadingCertification: true,
    searchContent: "",
  };

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCertificationName: event.target.value });
  };

  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchContent: event.target.value });
  };

  onEditButtonClick = (certificationId: string) => {
    this.props.history.push(`/certification/${certificationId}/edit`);
  };

  onCertificationCreate = async (
    event: React.ChangeEvent<HTMLButtonElement>
  ) => {
    try {
      const dueDate = this.calculateDueDate();
      const newCertification = await createCertification(
        this.props.auth.getIdToken(),
        {
          name: this.state.newCertificationName,
          dueDate,
        }
      );
      this.setState({
        certification: [...this.state.certification, newCertification],
        newCertificationName: "",
      });
    } catch {
      alert("Certification creation failed");
    }
  };

  onSearch = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      console.log("abc", this.state);
      const certification = await searchCertification(
        this.props.auth.getIdToken(),
        this.state.searchContent
      );
      this.setState({
        certification,
        loadingCertification: false,
      });
    } catch (e) {
      if (e instanceof Error) {
        alert(`Failed to fetch certification: ${e.message}`);
      }
    }
  };

  onCertificationDelete = async (certificationId: string) => {
    try {
      await deleteCertification(this.props.auth.getIdToken(), certificationId);
      this.setState({
        certification: this.state.certification.filter(
          (certification) => certification.certificationId !== certificationId
        ),
      });
    } catch {
      alert("Certification deletion failed");
    }
  };

  onCertificationCheck = async (pos: number) => {
    try {
      const certification = this.state.certification[pos];
      await patchCertification(
        this.props.auth.getIdToken(),
        certification.certificationId,
        {
          name: certification.name,
          dueDate: certification.dueDate,
          done: !certification.done,
        }
      );
      this.setState({
        certification: update(this.state.certification, {
          [pos]: { done: { $set: !certification.done } },
        }),
      });
    } catch {
      alert("Certification deletion failed");
    }
  };

  async componentDidMount() {
    try {
      const certification = await getCertification(
        this.props.auth.getIdToken()
      );
      this.setState({
        certification,
        loadingCertification: false,
      });
    } catch (e) {
      if (e instanceof Error) {
        alert(`Failed to fetch certification: ${e.message}`);
      }
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Certification</Header>

        {this.renderCreateCertificationInput()}
        {this.renderSearchCertificationInput()}
        {this.renderCertification()}
      </div>
    );
  }

  renderCreateCertificationInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: "teal",
              labelPosition: "left",
              icon: "add",
              content: "New Certification",
              onClick: this.onCertificationCreate,
            }}
            fluid
            actionPosition="left"
            placeholder="Udacity - Cloud Developer"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    );
  }

  renderSearchCertificationInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: "orange",
              labelPosition: "left",
              icon: "search",
              content: "Search certification",
              onClick: this.onSearch,
            }}
            fluid
            actionPosition="left"
            placeholder="Udacity - Cloud Developer "
            onChange={this.handleSearch}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    );
  }

  renderCertification() {
    if (this.state.loadingCertification) {
      return this.renderLoading();
    }

    return this.renderCertificationList();
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Certifications
        </Loader>
      </Grid.Row>
    );
  }

  renderCertificationList() {
    return (
      <Grid padded>
        {this.state.certification.map((certification, pos) => {
          return (
            <Grid.Row key={certification.certificationId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onCertificationCheck(pos)}
                  checked={certification.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {certification.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {certification.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() =>
                    this.onEditButtonClick(certification.certificationId)
                  }
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() =>
                    this.onCertificationDelete(certification.certificationId)
                  }
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {certification.attachmentUrl && (
                <Image src={certification.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          );
        })}
      </Grid>
    );
  }

  calculateDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);

    return dateFormat(date, "yyyy-mm-dd") as string;
  }
}
