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
import { Certifications } from "../types/Certifications";

interface CertificationProps {
  auth: Auth;
  history: History;
}

interface CertificationState {
  certifications: Certifications[];
  newCertificationName: string;
  loadingCertification: boolean;
  searchContent: string;
}

export class Certification extends React.PureComponent<
  CertificationProps,
  CertificationState
> {
  constructor(props: CertificationProps) {
    super(props);
    this.state = {
      certifications: [],
      newCertificationName: "",
      loadingCertification: true,
      searchContent: "",
    };
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCertificationName: event.target.value });
  };

  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchContent: event.target.value });
  };

  onEditButtonClick = (certificationId: string) => {
    this.props?.history?.push(`/certification/${certificationId}/edit`);
  };

  onCertificationCreate = async (
    event: React.ChangeEvent<HTMLButtonElement>
  ) => {
    try {
      const dueDate = this.calculateDueDate();
      const newCertification = await createCertification(
        this.props?.auth?.getIdToken(),
        {
          name: this.state?.newCertificationName,
          dueDate,
        }
      );
      console.log(newCertification, this.state?.certifications);
      this.setState({
        certifications: [
          ...(this.state?.certifications || []),
          newCertification,
        ],
        newCertificationName: newCertification?.name,
      });
    } catch (e) {
      console.log(e);
    }
  };

  onSearch = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      console.log("abc", this.state);
      const certifications = await searchCertification(
        this.props?.auth?.getIdToken(),
        this.state.searchContent
      );
      this.setState({
        certifications,
        loadingCertification: false,
      });
    } catch (e) {
      if (e instanceof Error) {
        console.log(e);
      }
    }
  };

  onCertificationDelete = async (certificationId: string) => {
    try {
      await deleteCertification(this.props.auth.getIdToken(), certificationId);
      this.setState({
        certifications: this.state?.certifications.filter(
          (certification) => certification?.certificationId !== certificationId
        ),
      });
    } catch (e) {
      console.log(e);
    }
  };

  onCertificationCheck = async (pos: number) => {
    try {
      const certification = this.state.certifications[pos];
      await patchCertification(
        this.props.auth.getIdToken(),
        certification.certificationId,
        {
          name: certification?.name,
          dueDate: certification?.dueDate,
          done: !certification?.done,
        }
      );
      this.setState({
        certifications: update(this.state.certifications, {
          [pos]: { done: { $set: !certification?.done } },
        }),
      });
    } catch (e) {
      console.log(e);
    }
  };

  async componentDidMount() {
    try {
      const certifications = await getCertification(
        this.props.auth.getIdToken()
      );
      this.setState({
        certifications,
        loadingCertification: false,
      });
    } catch (e) {
      if (e instanceof Error) {
        console.log(e);
      }
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Certification Goal</Header>

        {this.rendercreateCertificationInput()}
        {this.rendersearchCertificationInput()}
        {this.renderCertification()}
      </div>
    );
  }

  rendercreateCertificationInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: "teal",
              labelPosition: "left",
              icon: "add",
              content: "New goal",
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

  rendersearchCertificationInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: "orange",
              labelPosition: "left",
              icon: "search",
              content: "Search Goal",
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
        {this.state.certifications?.map((certification, pos) => {
          return (
            <Grid.Row key={certification?.certificationId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onCertificationCheck(pos)}
                  checked={certification?.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {certification?.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {certification?.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() =>
                    this.onEditButtonClick(certification?.certificationId)
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
                    this.onCertificationDelete(certification?.certificationId)
                  }
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {certification?.attachmentUrl && (
                <Image
                  src={certification?.attachmentUrl}
                  size="small"
                  wrapped
                />
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
